import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { accessibilityViolations, renderApp } from '@/test/render'
import { problem } from '@/test/handlers'
import { server } from '@/test/server'

describe('ProductsPage', () => {
  it('should_list_products_with_price_and_stock_badges', async () => {
    const { container } = renderApp('/productos')

    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
    expect(screen.getByText('$45.90')).toBeInTheDocument()
    expect(screen.getByText('Quedan 3')).toBeInTheDocument()
    expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0)
    expect(screen.getByText('Digital')).toBeInTheDocument()
    expect(screen.getByText('4 productos')).toBeInTheDocument()
    expect(await accessibilityViolations(container)).toEqual([])
  })

  it('should_show_skeletons_while_loading', async () => {
    renderApp('/productos')
    expect(await screen.findByLabelText('Cargando productos')).toBeInTheDocument()
    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })

  it('should_filter_by_name_after_typing_and_keep_it_in_the_url', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/productos')
    await screen.findByText('Monstera Deliciosa')

    await user.type(screen.getByLabelText('Buscar por nombre'), 'pothos')

    await waitFor(() => expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument())
    expect(screen.getByText('Pothos Dorado')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=pothos')
  })

  it('should_filter_by_category', async () => {
    const user = userEvent.setup()
    renderApp('/productos')
    await screen.findByText('Monstera Deliciosa')

    await user.click(screen.getByRole('combobox', { name: 'Categoría' }))
    await user.click(await screen.findByRole('option', { name: 'Flores' }))

    expect(await screen.findByText('Ramo de Girasoles')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument())
  })

  it('should_filter_by_price_range', async () => {
    const user = userEvent.setup()
    renderApp('/productos')
    await screen.findByText('Monstera Deliciosa')

    await user.type(screen.getByLabelText('Precio mín.'), '20')
    await user.type(screen.getByLabelText('Precio máx.'), '30')

    await waitFor(() => expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument())
    expect(screen.getByText('Pothos Dorado')).toBeInTheDocument()
    expect(screen.getByText('Ramo de Girasoles')).toBeInTheDocument()
    expect(screen.queryByText('Guía de Interior')).not.toBeInTheDocument()
  })

  it('should_read_filters_from_the_url_and_sort_by_price', async () => {
    renderApp('/productos?orden=price,desc&min=20')

    const cards = await screen.findAllByRole('heading', { level: 3 })
    expect(cards.map((c) => c.textContent)).toEqual([
      'Monstera Deliciosa',
      'Ramo de Girasoles',
      'Pothos Dorado',
    ])
  })

  it('should_offer_to_clear_filters_when_nothing_matches', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/productos?q=inexistente')

    expect(await screen.findByText('No encontramos plantas con esos filtros')).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('status')).getByRole('button', { name: 'Limpiar filtros' }),
    )

    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
  })

  it('should_hide_pagination_when_everything_fits_in_one_page', async () => {
    renderApp('/productos')
    await screen.findByText('Monstera Deliciosa')
    expect(
      screen.queryByRole('navigation', { name: 'Paginación de productos' }),
    ).not.toBeInTheDocument()
  })

  it('should_show_pagination_and_request_the_next_page', async () => {
    const requested: number[] = []
    server.use(
      http.get('*/api/v1/products', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 0)
        requested.push(page)
        return HttpResponse.json({
          content: [
            {
              id: 99 + page,
              type: 'DIGITAL',
              name: `Producto página ${page + 1}`,
              description: null,
              price: 5,
              imageUrl: null,
              category: { id: 1, name: 'Cat', description: null },
              stock: null,
              weightGrams: null,
              licenseType: 'PERSONAL',
              version: 0,
            },
          ],
          page,
          size: 12,
          totalElements: 30,
          totalPages: 3,
        })
      }),
    )
    const user = userEvent.setup()
    const { router } = renderApp('/productos')
    expect(await screen.findByText('Producto página 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ir a la página 2' }))

    expect(await screen.findByText('Producto página 2')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?pagina=2')
    expect(requested).toContain(1)
  })

  it('should_show_an_error_with_retry_when_the_api_fails', async () => {
    server.use(http.get('*/api/v1/products', () => problem(500, 'Error interno', 'boom')))
    const user = userEvent.setup()
    renderApp('/productos')

    expect(await screen.findByText(/problema/)).toBeInTheDocument()

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })
})

describe('ProductDetailPage', () => {
  it('should_show_a_physical_product_with_weight_and_stock', async () => {
    const { container } = renderApp('/productos/1')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Monstera Deliciosa' }),
    ).toBeInTheDocument()
    expect(screen.getByText('$45.90')).toBeInTheDocument()
    expect(screen.getByText('Producto físico')).toBeInTheDocument()
    expect(screen.getByText('1,8 kg')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(await accessibilityViolations(container)).toEqual([])
  })

  it('should_show_a_digital_product_with_license_and_no_stock', async () => {
    renderApp('/productos/25')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Guía de Interior' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Producto digital')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.queryByText('Disponibles')).not.toBeInTheDocument()
  })

  it('should_show_not_found_for_unknown_and_invalid_ids', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/productos/9999')

    expect(await screen.findByText('Este producto no existe')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver la tienda' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/productos'))

    await router.navigate('/productos/abc')
    expect(await screen.findByText('Este producto no existe')).toBeInTheDocument()
  })

  it('should_show_error_and_retry_for_server_failures', async () => {
    server.use(http.get('*/api/v1/products/:id', () => problem(500, 'Error interno', 'boom')))
    renderApp('/productos/1')

    expect(await screen.findByText(/problema/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('Home, layout and routing', () => {
  it('should_show_latest_products_on_the_home_page', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Verde que se siente/ }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })

  it('should_show_a_friendly_404_for_unknown_routes', async () => {
    renderApp('/no-existe')
    expect(await screen.findByText('Página no encontrada')).toBeInTheDocument()
  })

  it('should_toggle_color_mode_and_remember_it', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('button', { name: 'Cambiar a modo oscuro' }))

    expect(await screen.findByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument()
    expect(window.localStorage.getItem('bloom.colorMode')).toBe('dark')
  })

  it('should_have_a_skip_link_and_a_main_landmark', async () => {
    renderApp('/')
    expect(await screen.findByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido',
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
