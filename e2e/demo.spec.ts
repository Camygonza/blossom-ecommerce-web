import { expect, test, type Page } from '@playwright/test'
import { PASSWORD, loginAs, uniqueEmail } from './helpers'

/** Cartel con el paso que se está mostrando; se vuelve a pintar tras cada paso porque una navegación completa lo borra. */
async function caption(page: Page, text: string) {
  await page.evaluate((message) => {
    document.getElementById('demo-caption')?.remove()
    const box = document.createElement('div')
    box.id = 'demo-caption'
    box.textContent = message
    box.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;max-width:80%;' +
      'padding:12px 22px;border-radius:12px;background:rgba(20,32,26,.92);color:#fff;' +
      'font:600 20px/1.3 Segoe UI,Arial,sans-serif;text-align:center;pointer-events:none'
    document.body.appendChild(box)
  }, text)
}

/**
 * Recorrido completo para grabar el video de la demo: `npm run e2e:demo` (proyecto «demo», con video y cámara lenta).
 * No forma parte de la suite normal.
 */
test('demo: registro, búsqueda, compra, historial y gestión de la orden como admin', async ({
  page,
}) => {
  test.setTimeout(420_000)
  const pause = (ms = 1500) => page.waitForTimeout(ms * 2)
  const email = uniqueEmail('demo')

  // Registro
  await page.goto('/')
  await caption(page, '1. Portada de la tienda: categorías y novedades')
  await pause(2500)
  await page.getByRole('banner').getByRole('link', { name: 'Crear cuenta' }).click()
  await caption(page, '2. Registro de un cliente nuevo')
  await page.getByLabel('Nombre completo').fill('Ana Demo')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirma la contraseña').fill(PASSWORD)
  await pause(2000)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Tienda' })).toBeVisible()
  await caption(page, '3. Catálogo con las fotos de los productos y precios en pesos colombianos')
  await pause(3000)

  // Búsqueda con filtros
  await caption(page, '4. Búsqueda por nombre')
  await page.getByLabel('Buscar por nombre').fill('a')
  await pause(2000)
  await caption(page, '5. Filtro por categoría')
  await page.getByRole('combobox', { name: 'Categoría' }).click()
  await page.getByRole('option', { name: 'Plantas de interior' }).click()
  await pause(2000)
  await caption(page, '6. Filtro por precio máximo')
  await page.getByLabel('Precio máx.').fill('40000')
  await pause(3000)
  await caption(page, '7. Orden por precio, de menor a mayor')
  await page.getByRole('combobox', { name: 'Ordenar por' }).click()
  await page.getByRole('option', { name: 'Precio: menor a mayor' }).click()
  await pause(3000)

  // Modo oscuro y de vuelta
  await caption(page, '8. Modo oscuro')
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click()
  await pause(2500)
  await page.getByRole('button', { name: 'Cambiar a modo claro' }).click()
  await pause()

  // Cambio de idioma: la interfaz pasa a inglés y la moneda sigue en COP
  await caption(page, '9. Cambio de idioma a inglés (la moneda sigue en pesos)')
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Cambiar idioma a English/ })
    .click()
  await pause(3500)
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Switch language to Español/ })
    .click()
  await pause()

  // Detalle y carrito
  await caption(page, '10. Detalle de un producto')
  await page.getByRole('heading', { level: 3 }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await pause(3000)
  await caption(page, '11. Se agrega al carrito')
  await page.getByRole('button', { name: 'Agregar al carrito' }).click()
  await pause(2000)
  await page
    .getByRole('banner')
    .getByRole('link', { name: /Carrito/ })
    .click()
  await expect(page.getByRole('heading', { name: 'Tu carrito' })).toBeVisible()
  await caption(page, '12. Carrito con cantidades y total')
  await pause(3000)

  // Checkout
  await caption(page, '13. Finalizar compra: se crea la orden')
  await page.getByRole('button', { name: 'Finalizar compra' }).click()
  await expect(page.getByText('¡Gracias por tu compra!')).toBeVisible()
  await pause(3500)

  // Historial
  await page.goto('/ordenes')
  await expect(page.getByRole('heading', { name: 'Mis órdenes' })).toBeVisible()
  await caption(page, '14. Historial de órdenes del cliente')
  await pause(3500)
  const orderLink = page.getByRole('link', { name: /Orden #\d+/ }).first()
  // el id sale del enlace: el texto de la tarjeta pega el número con la fecha («#1» + «19 oct…»)
  const href = (await orderLink.getAttribute('href')) ?? ''
  const orderId = /(\d+)$/.exec(href)?.[1] ?? ''
  await orderLink.click()
  await caption(page, '15. Detalle de la orden: estado pendiente')
  await pause(3500)

  // Cierra sesión y entra como administración
  await page.getByRole('button', { name: 'Ana Demo' }).click()
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('banner').getByRole('link', { name: 'Ingresar' })).toBeVisible()
  await pause()
  await loginAs(page, 'admin@bloom.test', 'Admin123!')
  await caption(page, '16. Ingreso como administrador')
  await pause(2500)
  await page.getByRole('button', { name: 'Admin Bloom' }).click()
  await page.getByRole('menuitem', { name: 'Gestionar órdenes' }).click()
  await expect(page.getByRole('table', { name: 'Órdenes' })).toBeVisible()
  await caption(page, '17. Panel de órdenes: todas las órdenes de la tienda')
  await pause(3500)

  // La orden de Ana pasa a «Pagada»
  await caption(page, '18. El administrador cambia el estado de la orden a «Pagada»')
  await page.getByRole('combobox', { name: `Cambiar estado de la orden #${orderId}` }).click()
  await pause()
  await page.getByRole('option', { name: 'Pagada' }).click()
  await expect(page.getByText(`Orden #${orderId}: pagada`)).toBeVisible()
  await pause(3500)

  // Panel de productos
  await page.getByRole('button', { name: 'Admin Bloom' }).click()
  await page.getByRole('menuitem', { name: 'Gestionar productos' }).click()
  await expect(page.getByRole('table', { name: 'Productos' })).toBeVisible()
  await caption(page, '19. Panel de productos: alta, edición y baja')
  await pause(4000)
})
