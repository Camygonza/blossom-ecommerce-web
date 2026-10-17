import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { admin, authFor, customer, products } from '@/test/fixtures'
import { problem } from '@/test/handlers'
import { accessibilityViolations, renderApp } from '@/test/render'
import { server } from '@/test/server'
import { productFormSchema, toFormValues, toProductInput } from './productSchema'

beforeEach(() => {
  server.use(http.post('*/api/v1/auth/refresh', () => HttpResponse.json(authFor(admin, '3'))))
})

const asAdmin = (path: string) => renderApp(path, { auth: authFor(admin) })

describe('admin access', () => {
  it('should_block_customers_and_anonymous_users', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => HttpResponse.json(authFor(customer, '2'))))
    renderApp('/admin/productos', { auth: authFor(customer) })
    expect(await screen.findByText('Sin acceso')).toBeInTheDocument()
  })

  it('should_redirect_anonymous_users_to_login', async () => {
    const { router } = renderApp('/admin/ordenes')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('should_show_management_links_only_to_admins', async () => {
    const user = userEvent.setup()
    asAdmin('/')

    await user.click(await screen.findByRole('button', { name: 'Admin Bloom' }))

    expect(await screen.findByRole('menuitem', { name: 'Gestionar productos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Gestionar órdenes' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Mis órdenes' })).not.toBeInTheDocument()
  })
})

describe('AdminProductsPage', () => {
  it('should_list_products_in_a_table', async () => {
    const { container } = asAdmin('/admin/productos')

    expect(await screen.findByRole('table', { name: 'Productos' })).toBeInTheDocument()
    expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument()
    expect(screen.getByText('Guía de Interior')).toBeInTheDocument()
    expect(await accessibilityViolations(container)).toEqual([])
  })

  it('should_create_a_physical_product', async () => {
    let sent: Record<string, unknown> = {}
    server.use(
      http.post('*/api/v1/products', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(products[0], { status: 201 })
      }),
    )
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Nuevo producto' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' })
    await user.type(within(dialog).getByLabelText('Nombre'), 'Cactus nuevo')
    await user.type(within(dialog).getByLabelText('Precio'), '12.50')
    await user.click(within(dialog).getByRole('combobox', { name: 'Categoría' }))
    await user.click(await screen.findByRole('option', { name: 'Flores' }))
    await user.clear(within(dialog).getByLabelText('Stock'))
    await user.type(within(dialog).getByLabelText('Stock'), '7')
    await user.click(within(dialog).getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('«Cactus nuevo» creado')).toBeInTheDocument()
    expect(sent).toMatchObject({
      type: 'PHYSICAL',
      name: 'Cactus nuevo',
      price: 12.5,
      categoryId: 2,
      stock: 7,
      weightGrams: 0,
    })
  })

  it('should_validate_the_form_before_sending', async () => {
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Nuevo producto' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' })
    await user.click(within(dialog).getByRole('button', { name: 'Crear producto' }))

    expect(await within(dialog).findByText('Ingresa el nombre')).toBeInTheDocument()
    expect(within(dialog).getByText('Ingresa el precio')).toBeInTheDocument()
    expect(within(dialog).getByText('Elige una categoría')).toBeInTheDocument()
  })

  it('should_switch_the_form_fields_for_digital_products', async () => {
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Nuevo producto' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' })
    await user.click(within(dialog).getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: /Digital/ }))

    expect(within(dialog).getByLabelText('URL de descarga')).toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Stock')).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Crear producto' }))
    expect(await within(dialog).findByText('Ingresa la URL de descarga')).toBeInTheDocument()
  })

  it('should_edit_a_product_sending_its_version', async () => {
    let sent: Record<string, unknown> = {}
    server.use(
      http.put('*/api/v1/products/:id', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(products[0])
      }),
    )
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Editar Monstera Deliciosa' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar producto' })
    expect(within(dialog).getByLabelText('Nombre')).toHaveValue('Monstera Deliciosa')
    expect(within(dialog).getByRole('combobox', { name: 'Tipo' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.clear(within(dialog).getByLabelText('Precio'))
    await user.type(within(dialog).getByLabelText('Precio'), '49.90')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('«Monstera Deliciosa» actualizado')).toBeInTheDocument()
    expect(sent).toMatchObject({ price: 49.9, version: 0, stock: 12 })
  })

  it('should_show_the_api_error_inside_the_dialog_when_saving_fails', async () => {
    server.use(
      http.put('*/api/v1/products/:id', () =>
        problem(
          409,
          'Conflicto',
          'El producto cambió desde que lo leíste (versión 0, actual 1); recárgalo',
        ),
      ),
    )
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Editar Monstera Deliciosa' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar producto' })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    expect(await within(dialog).findByText(/cambió desde que lo leíste/)).toBeInTheDocument()
  })

  it('should_delete_after_confirming', async () => {
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Eliminar Pothos Dorado' }))
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('«Pothos Dorado» eliminado')).toBeInTheDocument()
  })

  it('should_explain_when_a_product_in_orders_cannot_be_deleted', async () => {
    server.use(
      http.delete('*/api/v1/products/:id', () =>
        problem(409, 'Conflicto', 'El producto ya figura en órdenes y no se puede eliminar'),
      ),
    )
    const user = userEvent.setup()
    asAdmin('/admin/productos')

    await user.click(await screen.findByRole('button', { name: 'Eliminar Pothos Dorado' }))
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText(/ya figura en órdenes/)).toBeInTheDocument()
  })

  it('should_search_by_name', async () => {
    const user = userEvent.setup()
    asAdmin('/admin/productos')
    await screen.findByText('Monstera Deliciosa')

    await user.type(screen.getByLabelText('Buscar producto'), 'pothos')

    await waitFor(() => expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument())
    expect(screen.getByText('Pothos Dorado')).toBeInTheDocument()
  })
})

describe('AdminOrdersPage', () => {
  it('should_list_orders_with_the_customer', async () => {
    const { container } = asAdmin('/admin/ordenes')

    expect(await screen.findByRole('table', { name: 'Órdenes' })).toBeInTheDocument()
    expect(screen.getByText('#7')).toBeInTheDocument()
    expect(screen.getAllByText('cliente@bloom.test')).toHaveLength(2)
    expect(await accessibilityViolations(container)).toEqual([])
  })

  it('should_filter_by_status', async () => {
    const user = userEvent.setup()
    asAdmin('/admin/ordenes')
    await screen.findByText('#7')

    await user.click(screen.getByRole('combobox', { name: 'Filtrar por estado' }))
    await user.click(await screen.findByRole('option', { name: 'Pagada' }))

    await waitFor(() => expect(screen.queryByText('#7')).not.toBeInTheDocument())
    expect(screen.getByText('#8')).toBeInTheDocument()
  })

  it('should_offer_only_valid_next_states_and_send_the_change', async () => {
    let sent: unknown
    server.use(
      http.patch('*/api/v1/orders/:id/status', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ id: 7, status: 'PAID' })
      }),
    )
    const user = userEvent.setup()
    asAdmin('/admin/ordenes')
    await screen.findByText('#7')

    await user.click(screen.getByRole('combobox', { name: 'Cambiar estado de la orden #7' }))
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Pagada', 'Cancelada'])
    await user.click(screen.getByRole('option', { name: 'Pagada' }))

    expect(await screen.findByText('Orden #7: pagada')).toBeInTheDocument()
    expect(sent).toEqual({ status: 'PAID' })
  })

  it('should_show_the_api_error_when_the_transition_is_rejected', async () => {
    server.use(
      http.patch('*/api/v1/orders/:id/status', () =>
        problem(409, 'Conflicto', 'Transición no permitida: PENDING → PAID'),
      ),
    )
    const user = userEvent.setup()
    asAdmin('/admin/ordenes')
    await screen.findByText('#7')

    await user.click(screen.getByRole('combobox', { name: 'Cambiar estado de la orden #7' }))
    await user.click(screen.getByRole('option', { name: 'Pagada' }))

    expect(await screen.findByText(/Transición no permitida/)).toBeInTheDocument()
  })
})

describe('productSchema', () => {
  const base = toFormValues(products[0])

  it('should_round_trip_a_product_through_the_form', () => {
    const input = toProductInput(base, 3)
    expect(input).toMatchObject({
      type: 'PHYSICAL',
      price: 45.9,
      stock: 12,
      weightGrams: 1800,
      version: 3,
    })
    expect(productFormSchema(true).safeParse(base).success).toBe(true)
  })

  it('should_reject_bad_prices_and_stock', () => {
    const schema = productFormSchema(false)
    for (const price of ['-1', 'abc', '1.234', '2000000']) {
      expect(schema.safeParse({ ...base, price }).success).toBe(false)
    }
    expect(schema.safeParse({ ...base, stock: '1.5' }).success).toBe(false)
    expect(schema.safeParse({ ...base, weightGrams: '' }).success).toBe(false)
  })

  it('should_allow_empty_download_url_only_when_editing_digital_products', () => {
    const digital = { ...toFormValues(products[3]) }
    expect(productFormSchema(true).safeParse(digital).success).toBe(true)
    expect(productFormSchema(false).safeParse(digital).success).toBe(false)
    expect(toProductInput(digital)).toMatchObject({ type: 'DIGITAL', licenseType: 'PERSONAL' })
    expect(toProductInput(digital).downloadUrl).toBeUndefined()
  })
})
