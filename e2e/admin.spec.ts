import { expect, test } from '@playwright/test'
import { loginAs, registerCustomer, shot } from './helpers'

test('admin: crea, edita y elimina un producto', async ({ page }, info) => {
  const name = `E2E Planta ${Date.now()}`
  await loginAs(page, 'admin@bloom.test', 'Admin123!')

  await page.goto('/admin/productos')
  await expect(page.getByRole('table', { name: 'Productos' })).toBeVisible()
  await shot(page, info, '08-admin-productos')

  // alta
  await page.getByRole('button', { name: 'Nuevo producto' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nuevo producto' })
  await dialog.getByLabel('Nombre').fill(name)
  await dialog.getByLabel('Precio').fill('9500')
  await dialog.getByRole('combobox', { name: 'Categoría' }).click()
  await page.getByRole('option', { name: 'Flores' }).click()
  await dialog.getByLabel('Stock').fill('3')
  await dialog.getByLabel('Peso (gramos)').fill('200')
  await dialog.getByRole('button', { name: 'Crear producto' }).click()
  await expect(page.getByText(`«${name}» creado`)).toBeVisible()

  // aparece en el catálogo público con su precio
  await page.goto(`/productos?q=${encodeURIComponent(name)}`)
  await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible()
  await expect(page.getByText('9.500')).toBeVisible()

  // edición (envía la versión leída)
  await page.goto('/admin/productos')
  await page.getByLabel('Buscar producto').fill(name)
  await page.getByRole('button', { name: `Editar ${name}` }).click()
  const edit = page.getByRole('dialog', { name: 'Editar producto' })
  await edit.getByLabel('Precio').fill('12000')
  await edit.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText(`«${name}» actualizado`)).toBeVisible()
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('12.000')

  // baja
  await page.getByRole('button', { name: `Eliminar ${name}` }).click()
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByText(`«${name}» eliminado`)).toBeVisible()
})

test('admin: cambia el estado de una orden y el cliente lo ve', async ({ page, request }, info) => {
  const customer = await registerCustomer(request)
  const created = await request.post('/api/v1/orders', {
    headers: { Authorization: `Bearer ${customer.token}` },
    data: { items: [{ productId: 25, quantity: 1 }] },
  })
  expect(created.status()).toBe(201)
  const orderId = (await created.json()).id as number

  await loginAs(page, 'admin@bloom.test', 'Admin123!')
  await page.goto('/admin/ordenes')
  const row = page.getByRole('row', { name: new RegExp(customer.email) })
  await expect(row).toBeVisible()
  await shot(page, info, '09-admin-ordenes')

  await row.getByRole('combobox', { name: `Cambiar estado de la orden #${orderId}` }).click()
  await page.getByRole('option', { name: 'Pagada' }).click()
  await expect(page.getByText(`Orden #${orderId}: pagada`)).toBeVisible()
  await expect(row).toContainText('Pagada')

  const mine = await request.get(`/api/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${customer.token}` },
  })
  expect((await mine.json()).status).toBe('PAID')
})

test('un cliente no entra al panel de administración', async ({ page }) => {
  await loginAs(page, 'cliente@bloom.test', 'Cliente123!')
  await page.goto('/admin/productos')
  await expect(page.getByText('Sin acceso')).toBeVisible()
})
