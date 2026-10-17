import { http, HttpResponse } from 'msw'
import type { Page, Product } from '@/api/types'
import { authFor, categories, customer, orderFixture, products } from './fixtures'

export const problem = (status: number, title: string, detail: string, extra: object = {}) =>
  HttpResponse.json(
    { status, title, detail, ...extra },
    {
      status,
      headers: { 'Content-Type': 'application/problem+json' },
    },
  )

/** Respuesta del api simulada: filtra, ordena y pagina los productos de prueba como lo haría el backend. */
function searchProducts(url: URL): Page<Product> {
  const q = url.searchParams
  const name = q.get('name')?.toLowerCase()
  const categoryId = q.get('categoryId')
  const min = q.get('minPrice')
  const max = q.get('maxPrice')
  let result = products.filter(
    (p) =>
      (!name || p.name.toLowerCase().includes(name)) &&
      (!categoryId || p.category.id === Number(categoryId)) &&
      (!min || p.price >= Number(min)) &&
      (!max || p.price <= Number(max)),
  )
  const [prop, dir] = (q.get('sort') ?? 'id,asc').split(',')
  result = [...result].sort((a, b) => {
    const left = a[prop as 'id' | 'price' | 'name']
    const right = b[prop as 'id' | 'price' | 'name']
    const order = left < right ? -1 : left > right ? 1 : 0
    return dir === 'desc' ? -order : order
  })
  const size = Number(q.get('size') ?? 12)
  const page = Number(q.get('page') ?? 0)
  return {
    content: result.slice(page * size, page * size + size),
    page,
    size,
    totalElements: result.length,
    totalPages: Math.ceil(result.length / size),
  }
}

export const handlers = [
  http.get('*/api/v1/products', ({ request }) =>
    HttpResponse.json(searchProducts(new URL(request.url))),
  ),
  http.get('*/api/v1/products/:id', ({ params }) => {
    const found = products.find((p) => p.id === Number(params.id))
    return found
      ? HttpResponse.json(found)
      : problem(404, 'Recurso no encontrado', `Producto ${params.id} no encontrado`)
  }),
  http.post('*/api/v1/orders', async ({ request }) => {
    const body = (await request.json()) as { items: { productId: number; quantity: number }[] }
    const items = body.items.map((line) => {
      const product = products.find((p) => p.id === line.productId)!
      return {
        productId: product.id,
        productName: product.name,
        quantity: line.quantity,
        unitPrice: product.price,
        subtotal: product.price * line.quantity,
      }
    })
    const total = items.reduce((sum, item) => sum + item.subtotal, 0)
    return HttpResponse.json({ ...orderFixture, id: 21, items, total }, { status: 201 })
  }),
  http.get('*/api/v1/orders/me', () =>
    HttpResponse.json({
      content: [orderFixture],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    }),
  ),
  http.get('*/api/v1/orders/:id', ({ params }) =>
    Number(params.id) === orderFixture.id
      ? HttpResponse.json(orderFixture)
      : problem(404, 'Recurso no encontrado', `Orden ${params.id} no encontrada`),
  ),
  http.post('*/api/v1/orders/:id/cancel', () =>
    HttpResponse.json({ ...orderFixture, status: 'CANCELLED' }),
  ),
  http.get('*/api/v1/orders', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status')
    const all = [orderFixture, { ...orderFixture, id: 8, status: 'PAID' as const }]
    const content = status ? all.filter((o) => o.status === status) : all
    return HttpResponse.json({
      content,
      page: 0,
      size: 10,
      totalElements: content.length,
      totalPages: 1,
    })
  }),
  http.patch('*/api/v1/orders/:id/status', async ({ request, params }) => {
    const body = (await request.json()) as { status: string }
    return HttpResponse.json({ ...orderFixture, id: Number(params.id), status: body.status })
  }),
  http.post('*/api/v1/products', () => HttpResponse.json(products[0], { status: 201 })),
  http.put('*/api/v1/products/:id', () => HttpResponse.json(products[0])),
  http.delete('*/api/v1/products/:id', () => new HttpResponse(null, { status: 204 })),
  http.get('*/api/v1/categories', () => HttpResponse.json(categories)),
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    return body.password === 'Cliente123!'
      ? HttpResponse.json(authFor({ ...customer, email: body.email }))
      : problem(401, 'No autenticado', 'Credenciales inválidas')
  }),
  http.post('*/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; fullName: string }
    if (body.email === 'repetido@bloom.test') {
      return problem(409, 'Conflicto', 'El correo ya está registrado')
    }
    return HttpResponse.json(authFor({ ...customer, email: body.email, fullName: body.fullName }), {
      status: 201,
    })
  }),
  http.post('*/api/v1/auth/refresh', () => HttpResponse.json(authFor(customer, '2'))),
  http.post('*/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),
]
