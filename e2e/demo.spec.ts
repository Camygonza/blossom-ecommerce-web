import { expect, test } from '@playwright/test'
import { PASSWORD, loginAs, uniqueEmail } from './helpers'

/**
 * Recorrido completo para grabar el video de la demo: `npm run e2e:demo` (proyecto «demo», con video y cámara lenta).
 * No forma parte de la suite normal.
 */
test('demo: registro, búsqueda, compra, historial y gestión de la orden como admin', async ({
  page,
}) => {
  test.setTimeout(240_000)
  const pause = (ms = 1200) => page.waitForTimeout(ms)
  const email = uniqueEmail('demo')

  // Registro
  await page.goto('/')
  await pause()
  await page.getByRole('banner').getByRole('link', { name: 'Crear cuenta' }).click()
  await page.getByLabel('Nombre completo').fill('Ana Demo')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirma la contraseña').fill(PASSWORD)
  await pause()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Tienda' })).toBeVisible()
  await pause(2000)

  // Búsqueda con filtros
  await page.getByLabel('Buscar por nombre').fill('a')
  await pause()
  await page.getByRole('combobox', { name: 'Categoría' }).click()
  await page.getByRole('option', { name: 'Plantas de interior' }).click()
  await pause()
  await page.getByLabel('Precio máx.').fill('40000')
  await pause(2000)
  await page.getByRole('combobox', { name: 'Ordenar por' }).click()
  await page.getByRole('option', { name: 'Precio: menor a mayor' }).click()
  await pause(2000)

  // Modo oscuro y de vuelta
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click()
  await pause(1500)
  await page.getByRole('button', { name: 'Cambiar a modo claro' }).click()
  await pause()

  // Cambio de idioma: la interfaz pasa a inglés y la moneda sigue en COP
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Cambiar idioma a English/ })
    .click()
  await pause(2500)
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Switch language to Español/ })
    .click()
  await pause()

  // Detalle y carrito
  await page.getByRole('heading', { level: 3 }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await pause(2000)
  await page.getByRole('button', { name: 'Agregar al carrito' }).click()
  await pause()
  await page
    .getByRole('banner')
    .getByRole('link', { name: /Carrito/ })
    .click()
  await expect(page.getByRole('heading', { name: 'Tu carrito' })).toBeVisible()
  await pause(2000)

  // Checkout
  await page.getByRole('button', { name: 'Finalizar compra' }).click()
  await expect(page.getByText('¡Gracias por tu compra!')).toBeVisible()
  await pause(2500)

  // Historial
  await page.goto('/ordenes')
  await expect(page.getByRole('heading', { name: 'Mis órdenes' })).toBeVisible()
  await pause(2500)
  const orderLink = page.getByRole('link', { name: /Orden #\d+/ }).first()
  // el id sale del enlace: el texto de la tarjeta pega el número con la fecha («#1» + «19 oct…»)
  const href = (await orderLink.getAttribute('href')) ?? ''
  const orderId = /(\d+)$/.exec(href)?.[1] ?? ''
  await orderLink.click()
  await pause(2000)

  // Cierra sesión y entra como administración
  await page.getByRole('button', { name: 'Ana Demo' }).click()
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('banner').getByRole('link', { name: 'Ingresar' })).toBeVisible()
  await pause()
  await loginAs(page, 'admin@bloom.test', 'Admin123!')
  await page.getByRole('button', { name: 'Admin Bloom' }).click()
  await page.getByRole('menuitem', { name: 'Gestionar órdenes' }).click()
  await expect(page.getByRole('table', { name: 'Órdenes' })).toBeVisible()
  await pause(2500)

  // La orden de Ana pasa a «Pagada»
  await page.getByRole('combobox', { name: `Cambiar estado de la orden #${orderId}` }).click()
  await pause()
  await page.getByRole('option', { name: 'Pagada' }).click()
  await expect(page.getByText(`Orden #${orderId}: pagada`)).toBeVisible()
  await pause(2500)

  // Panel de productos
  await page.getByRole('button', { name: 'Admin Bloom' }).click()
  await page.getByRole('menuitem', { name: 'Gestionar productos' }).click()
  await expect(page.getByRole('table', { name: 'Productos' })).toBeVisible()
  await pause(3000)
})
