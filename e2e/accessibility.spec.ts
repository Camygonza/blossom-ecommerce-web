import { createRequire } from 'node:module'
import { expect, test, type Page } from '@playwright/test'
import { loginAs, PASSWORD, registerCustomer } from './helpers'

const axePath = createRequire(import.meta.url).resolve('axe-core')

interface Violation {
  id: string
  help: string
  nodes: { target: unknown[] }[]
}

/** axe-core en el navegador real (con contraste de color, que jsdom no puede medir) en WCAG 2.1 AA. */
async function violations(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: axePath })
  const found = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: { run: (c: Document, o: object) => Promise<{ violations: Violation[] }> }
      }
    ).axe
    const result = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    })
    return result.violations
  })
  return found.map(
    (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
  )
}

// axe se inyecta como script en línea: con la CSP de nginx activa hay que saltarla solo en esta prueba
test.use({ bypassCSP: true })

const PUBLIC_PAGES = [
  '/',
  '/productos',
  '/productos/1',
  '/productos/25',
  '/login',
  '/registro',
  '/carrito',
]

// Datos que dejan visibles todos los chips (estados de orden, poco stock, agotado) aunque la base esté vacía.
let customerEmail = ''

test.beforeAll(async ({ request }) => {
  const admin = await request.post('/api/v1/auth/login', {
    data: { email: 'admin@bloom.test', password: 'Admin123!' },
  })
  const adminAuth = { Authorization: `Bearer ${(await admin.json()).accessToken}` }
  const stockLevels = [2, 0]
  for (const stock of stockLevels) {
    await request.post('/api/v1/products', {
      headers: adminAuth,
      data: {
        type: 'PHYSICAL',
        name: `A11y stock ${stock} ${Date.now()}`,
        price: 5,
        categoryId: 1,
        stock,
        weightGrams: 10,
      },
    })
  }
  const customer = await registerCustomer(request)
  customerEmail = customer.email
  const buyer = { Authorization: `Bearer ${customer.token}` }
  const ids: number[] = []
  for (let i = 0; i < 4; i++) {
    const order = await request.post('/api/v1/orders', {
      headers: buyer,
      data: { items: [{ productId: 25, quantity: 1 }] },
    })
    ids.push((await order.json()).id)
  }
  const patch = (id: number, status: string) =>
    request.patch(`/api/v1/orders/${id}/status`, { headers: adminAuth, data: { status } })
  await patch(ids[1], 'PAID')
  await patch(ids[2], 'PAID')
  await patch(ids[2], 'SHIPPED')
  await patch(ids[3], 'CANCELLED')
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`accesibilidad AA (${scheme})`, () => {
    test.use({ colorScheme: scheme })

    for (const path of PUBLIC_PAGES) {
      test(`${path} sin violaciones`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('main')).toBeVisible()
        expect(await violations(page)).toEqual([])
      })
    }

    test('órdenes del cliente sin violaciones', async ({ page }) => {
      await loginAs(page, customerEmail, PASSWORD)
      await page.goto('/ordenes')
      await expect(page.getByRole('link', { name: /Orden #/ }).first()).toBeVisible()
      expect(await violations(page)).toEqual([])
      await page
        .getByRole('link', { name: /Orden #/ })
        .first()
        .click()
      await expect(page.getByRole('heading', { level: 1, name: /Orden #/ })).toBeVisible()
      expect(await violations(page)).toEqual([])
    })

    test('páginas con sesión (órdenes y panel admin)', async ({ page }) => {
      await loginAs(page, 'admin@bloom.test', 'Admin123!')
      for (const path of ['/admin/productos', '/admin/ordenes']) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        expect(await violations(page), path).toEqual([])
      }
    })
  })
}
