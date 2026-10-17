import { http, HttpResponse } from 'msw'
import type { Page, Product } from '@/api/types'
import { authFor, categories, customer, products } from './fixtures'

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
