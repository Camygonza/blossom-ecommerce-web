import { expect, test } from '@playwright/test'

test('el idioma se cambia desde la cabecera, se recuerda y no cambia la moneda', async ({
  page,
}) => {
  await page.goto('/productos')
  await expect(page.getByRole('heading', { name: 'Tienda' })).toBeVisible()
  await expect(page.getByText(/\$\s?58\.900/).first()).toBeVisible()

  await page
    .getByRole('banner')
    .getByRole('button', { name: /Cambiar idioma a English/ })
    .click()
  await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  // la moneda sigue siendo COP
  await expect(page.getByText(/\$\s?58\.900/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Add .* to cart/ }).first()).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible()

  await page
    .getByRole('banner')
    .getByRole('button', { name: /Switch language to Español/ })
    .click()
  await expect(page.getByRole('heading', { name: 'Tienda' })).toBeVisible()
})
