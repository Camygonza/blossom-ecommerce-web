import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { ProductArt } from './ProductArt'
import { ProductImage } from './ProductImage'

const NAMES: [string, number][] = [
  ['Costilla de Adán', 1],
  ['Potus', 1],
  ['Lengua de suegra', 1],
  ['Ficus lira', 1],
  ['Calatea', 1],
  ['Zamioculca', 1],
  ['Helecho', 1],
  ['Ramo de girasoles', 2],
  ['Docena de rosas rojas', 2],
  ['Tulipanes de colores', 2],
  ['Lavanda en maceta', 2],
  ['Orquídea blanca', 2],
  ['Peonías rosadas', 2],
  ['Maceta blanca de cerámica', 3],
  ['Maceta de barro 15 cm', 3],
  ['Base de madera para plantas', 3],
  ['Colgante de macramé', 3],
  ['Set de 3 macetas', 3],
  ['Tijeras de podar', 4],
  ['Regadera amarilla', 4],
  ['Kit de jardinería', 4],
  ['Tierra para plantas 10 L', 4],
  ['Atomizador de agua', 4],
  ['Abono orgánico', 4],
  ['Guía de cuidado de plantas', 5],
  ['Curso de esquejes', 5],
  ['Calendario lunar de siembra', 5],
  ['Etiquetas para plantas', 5],
  ['Guía de huerto en casa', 5],
  ['Pack de guías con licencia comercial', 5],
]

describe('ProductArt', () => {
  it.each(NAMES)('should_draw_an_illustration_for_%s', (name, categoryId) => {
    const { container } = render(<ProductArt product={{ name, categoryId }} />)

    expect(screen.getByRole('img', { name })).toBeInTheDocument()
    // cada motivo dibuja formas además del fondo (rect + círculos)
    expect(container.querySelectorAll('path, ellipse, circle, rect').length).toBeGreaterThan(8)
  })

  it('should_fall_back_to_the_category_or_a_generic_motif_for_unknown_products', () => {
    for (const [name, categoryId, type] of [
      ['Producto nuevo', 1, undefined],
      ['Producto nuevo', 2, undefined],
      ['Producto nuevo', 3, undefined],
      ['Producto nuevo', 4, undefined],
      ['Producto nuevo', 5, undefined],
      ['Producto nuevo', 99, 'DIGITAL'],
      ['Producto nuevo', 99, 'PHYSICAL'],
    ] as const) {
      const { container, unmount } = render(<ProductArt product={{ name, categoryId, type }} />)
      expect(container.querySelectorAll('path, ellipse, circle, rect').length).toBeGreaterThan(5)
      unmount()
    }
  })
})

describe('ProductImage', () => {
  const product = { name: 'Costilla de Adán', categoryId: 1, imageUrl: '/products/01.jpg' }

  it('should_show_the_photo_when_there_is_one', () => {
    render(<ProductImage product={product} />)
    expect(screen.getByRole('img', { name: 'Costilla de Adán' })).toHaveAttribute(
      'src',
      '/products/01.jpg',
    )
  })

  it('should_draw_the_illustration_when_the_photo_fails_to_load', () => {
    const { container } = render(<ProductImage product={product} />)

    fireEvent.error(screen.getByRole('img', { name: 'Costilla de Adán' }))

    expect(container.querySelector('img')).toBeNull()
    expect(
      within(container).getByRole('img', { name: 'Costilla de Adán' }).tagName.toLowerCase(),
    ).toBe('svg')
  })

  it('should_draw_the_illustration_when_there_is_no_photo', () => {
    const { container } = render(<ProductImage product={{ ...product, imageUrl: null }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('header search', () => {
  it('should_take_the_user_to_the_catalog_filtered_by_name', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    await user.type(
      await screen.findByRole('textbox', { name: 'Buscar en la tienda' }),
      'potus{Enter}',
    )

    await waitFor(() => expect(router.state.location.pathname).toBe('/productos'))
    expect(router.state.location.search).toBe('?q=potus')
  })

  it('should_open_the_whole_catalog_when_the_search_is_empty', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    await user.type(await screen.findByRole('textbox', { name: 'Buscar en la tienda' }), '{Enter}')

    await waitFor(() => expect(router.state.location.pathname).toBe('/productos'))
    expect(router.state.location.search).toBe('')
  })
})

describe('home page', () => {
  it('should_show_categories_with_their_icons_and_the_hero', async () => {
    renderApp('/')

    expect(await screen.findByRole('link', { name: /Plantas de interior/ })).toHaveAttribute(
      'href',
      '/productos?categoria=1',
    )
    expect(screen.getByRole('img', { name: 'Plantas y flores ilustradas' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Compra por categoría' })).toBeInTheDocument()
  })
})
