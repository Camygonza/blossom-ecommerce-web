import { expect, test } from '@playwright/test'
import { PASSWORD, shot, uniqueEmail } from './helpers'

test('cliente: registro, búsqueda, compra, historial y cancelación', async ({ page }, info) => {
  const email = uniqueEmail()

  // 1. Registro
  await page.goto('/registro')
  await page.getByLabel('Nombre completo').fill('Ana E2E')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirma la contraseña').fill(PASSWORD)
  await shot(page, info, '01-registro')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/productos$/)
  await expect(page.getByRole('heading', { name: 'Tienda' })).toBeVisible()

  // 2. Listado y búsqueda con filtros
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()
  await shot(page, info, '02-listado')
  await page.getByLabel('Buscar por nombre').fill('costilla')
  await expect(page.getByRole('heading', { name: 'Costilla de Adán', level: 3 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Potus', level: 3 })).toHaveCount(0)
  await expect(page).toHaveURL(/q=costilla/)
  await shot(page, info, '03-busqueda')

  // 3. Detalle y carrito
  await page
    .getByRole('link', { name: /Costilla de Adán/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Costilla de Adán', level: 1 })).toBeVisible()
  await shot(page, info, '04-detalle')
  await page.getByRole('button', { name: 'Agregar al carrito' }).click()
  await expect(page.getByRole('link', { name: 'Carrito, 1 artículo' })).toBeVisible()
  await page
    .getByRole('banner')
    .getByRole('link', { name: /Carrito/ })
    .click()
  await expect(page.getByRole('heading', { name: 'Tu carrito' })).toBeVisible()
  await shot(page, info, '05-carrito')

  // 4. Checkout: crea la orden y muestra la confirmación
  await page.getByRole('button', { name: 'Finalizar compra' }).click()
  await expect(page.getByText('¡Gracias por tu compra!')).toBeVisible()
  await expect(page).toHaveURL(/\/ordenes\/\d+$/)
  await shot(page, info, '06-orden-creada')

  // 5. Historial
  await page.goto('/ordenes')
  await expect(page.getByRole('heading', { name: 'Mis órdenes' })).toBeVisible()
  await expect(page.getByText('Pendiente')).toBeVisible()
  await shot(page, info, '07-historial')

  // 6. Cancelación: el estado cambia
  await page
    .getByRole('link', { name: /Orden #\d+/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Cancelar orden' }).click()
  await page.getByRole('button', { name: 'Sí, cancelar' }).click()
  await expect(page.getByText('Cancelada').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancelar orden' })).toHaveCount(0)
})

test('el carrito sobrevive a recargar y exige login para pagar', async ({ page }) => {
  await page.goto('/productos/2')
  await page.getByRole('button', { name: 'Agregar al carrito' }).click()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Carrito, 1 artículo' })).toBeVisible()

  await page.goto('/carrito')
  await page.getByRole('button', { name: 'Ingresa para comprar' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Correo').fill('cliente@bloom.test')
  await page.getByLabel('Contraseña').fill('Cliente123!')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/carrito$/)
  await expect(page.getByText('Potus')).toBeVisible()
})

test('la sesión se restaura al recargar y se cierra al salir', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Correo').fill('cliente@bloom.test')
  await page.getByLabel('Contraseña').fill('Cliente123!')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByRole('button', { name: 'Cliente Demo' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Cliente Demo' })).toBeVisible()

  await page.getByRole('button', { name: 'Cliente Demo' }).click()
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('banner').getByRole('link', { name: 'Ingresar' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('banner').getByRole('link', { name: 'Ingresar' })).toBeVisible()
})

test('login con credenciales incorrectas muestra el error del api', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Correo').fill('nadie@bloom.test')
  await page.getByLabel('Contraseña').fill('Incorrecta1!')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByText('Credenciales inválidas')).toBeVisible()
})

test('rutas protegidas redirigen al login', async ({ page }) => {
  await page.goto('/ordenes')
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/admin/productos')
  await expect(page).toHaveURL(/\/login$/)
})
