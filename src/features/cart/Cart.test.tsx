import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { authFor, admin, customer } from '@/test/fixtures'
import { problem } from '@/test/handlers'
import { accessibilityViolations, renderApp } from '@/test/render'
import { server } from '@/test/server'

const addFromDetail = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Agregar al carrito' }))
}

describe('adding to the cart', () => {
  it('should_add_from_the_detail_page_and_update_the_header_badge', async () => {
    const user = userEvent.setup()
    renderApp('/productos/1')

    await user.clear(await screen.findByLabelText('Cantidad'))
    await user.type(screen.getByLabelText('Cantidad'), '2')
    await addFromDetail(user)

    expect(await screen.findByText('Monstera Deliciosa se agregó al carrito')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Carrito, 2 artículos' })).toBeInTheDocument()
    expect(window.localStorage.getItem('bloom.cart')).toContain('Monstera Deliciosa')
  })

  it('should_add_from_a_product_card', async () => {
    const user = userEvent.setup()
    renderApp('/productos')

    await user.click(
      await screen.findByRole('button', { name: 'Agregar Pothos Dorado al carrito' }),
    )

    expect(screen.getByRole('link', { name: 'Carrito, 1 artículo' })).toBeInTheDocument()
  })

  it('should_disable_adding_when_sold_out_or_when_everything_is_already_in_the_cart', async () => {
    const user = userEvent.setup()
    renderApp('/productos')

    expect(
      await screen.findByRole('button', { name: 'Agregar Ramo de Girasoles al carrito' }),
    ).toBeDisabled()

    const digital = screen.getByRole('button', { name: 'Agregar Guía de Interior al carrito' })
    await user.click(digital)
    expect(digital).toBeDisabled()
    expect(digital).toHaveTextContent('En tu carrito')
  })

  it('should_remember_the_cart_after_reloading_the_app', async () => {
    const user = userEvent.setup()
    const first = renderApp('/productos/1')
    await addFromDetail(user)
    first.unmount()

    renderApp('/carrito')

    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })
})

describe('CartPage', () => {
  it('should_show_an_empty_state_with_a_way_back_to_the_shop', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/carrito')

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Explorar la tienda' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/productos'))
  })

  it('should_change_quantities_remove_items_and_recompute_the_total', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/productos')
    await user.click(
      await screen.findByRole('button', { name: 'Agregar Monstera Deliciosa al carrito' }),
    )
    await user.click(screen.getByRole('button', { name: 'Agregar Pothos Dorado al carrito' }))
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    expect(await screen.findByLabelText('Total del carrito')).toHaveTextContent('$68.40')
    expect(await accessibilityViolations(container)).toEqual([])

    await user.click(
      screen.getByRole('button', { name: 'Agregar una unidad de Monstera Deliciosa' }),
    )
    expect(screen.getByLabelText('Cantidad de Monstera Deliciosa')).toHaveTextContent('2')
    expect(screen.getByLabelText('Total del carrito')).toHaveTextContent('$114.30')

    await user.click(
      screen.getByRole('button', { name: 'Quitar una unidad de Monstera Deliciosa' }),
    )
    expect(
      screen.getByRole('button', { name: 'Quitar una unidad de Monstera Deliciosa' }),
    ).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Eliminar Pothos Dorado del carrito' }))
    expect(screen.queryByText('Pothos Dorado')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Total del carrito')).toHaveTextContent('$45.90')

    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it('should_not_allow_more_units_than_the_stock', async () => {
    const user = userEvent.setup()
    renderApp('/productos/2')
    await user.clear(await screen.findByLabelText('Cantidad'))
    await user.type(screen.getByLabelText('Cantidad'), '9')
    await addFromDetail(user)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    expect(await screen.findByLabelText('Cantidad de Pothos Dorado')).toHaveTextContent('3')
    expect(
      screen.getByRole('button', { name: 'Agregar una unidad de Pothos Dorado' }),
    ).toBeDisabled()
  })
})

describe('checkout', () => {
  it('should_send_anonymous_users_to_login_and_come_back_to_the_cart', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/productos/1')
    await addFromDetail(user)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    await user.click(await screen.findByRole('button', { name: 'Ingresa para comprar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    await user.type(await screen.findByLabelText('Correo'), 'cliente@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Cliente123!')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/carrito'))
    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })

  it('should_create_the_order_clear_the_cart_and_show_the_confirmation', async () => {
    let sent: unknown
    server.use(
      http.post('*/api/v1/orders', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json(
          {
            id: 21,
            status: 'PENDING',
            total: 91.8,
            createdAt: '2026-03-05T15:30:00Z',
            customerEmail: 'c@b.co',
            items: [
              {
                productId: 1,
                productName: 'Monstera Deliciosa',
                quantity: 2,
                unitPrice: 45.9,
                subtotal: 91.8,
              },
            ],
          },
          { status: 201 },
        )
      }),
      http.get('*/api/v1/orders/21', () =>
        HttpResponse.json({
          id: 21,
          status: 'PENDING',
          total: 91.8,
          createdAt: '2026-03-05T15:30:00Z',
          customerEmail: 'c@b.co',
          items: [
            {
              productId: 1,
              productName: 'Monstera Deliciosa',
              quantity: 2,
              unitPrice: 45.9,
              subtotal: 91.8,
            },
          ],
        }),
      ),
    )
    const user = userEvent.setup()
    const { router } = renderApp('/productos/1', { auth: authFor(customer) })
    await screen.findByRole('button', { name: 'Cliente Demo' })
    await user.clear(await screen.findByLabelText('Cantidad'))
    await user.type(screen.getByLabelText('Cantidad'), '2')
    await addFromDetail(user)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    await user.click(await screen.findByRole('button', { name: 'Finalizar compra' }))

    expect(
      await screen.findByText('¡Gracias por tu compra! Recibimos tu orden.'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/ordenes/21')
    expect(sent).toEqual({ items: [{ productId: 1, quantity: 2 }] })
    expect(window.localStorage.getItem('bloom.cart')).toBe('[]')
    expect(screen.getByRole('link', { name: 'Carrito, 0 artículos' })).toBeInTheDocument()
  })

  it('should_keep_the_cart_and_explain_when_there_is_not_enough_stock', async () => {
    server.use(
      http.post('*/api/v1/orders', () =>
        problem(
          409,
          'Conflicto',
          "Stock insuficiente para 'Monstera Deliciosa': disponible 1, solicitado 2",
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp('/productos/1', { auth: authFor(customer) })
    await screen.findByRole('button', { name: 'Cliente Demo' })
    await addFromDetail(user)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    await user.click(await screen.findByRole('button', { name: 'Finalizar compra' }))

    expect(await screen.findByText(/Stock insuficiente/)).toBeInTheDocument()
    expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument()
  })

  it('should_explain_that_admin_accounts_do_not_buy', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => HttpResponse.json(authFor(admin, '3'))))
    const user = userEvent.setup()
    renderApp('/productos/1', { auth: authFor(admin) })
    await screen.findByRole('button', { name: 'Admin Bloom' })
    await addFromDetail(user)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))

    await user.click(await screen.findByRole('button', { name: 'Finalizar compra' }))

    expect(within(screen.getByRole('main')).getByText(/no realizan compras/)).toBeInTheDocument()
  })
})
