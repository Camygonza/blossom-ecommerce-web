import { test } from '@playwright/test'

const DIR = process.env.PREVIEW_DIR ?? 'preview'

for (const scheme of ['light', 'dark'] as const) {
  test(`vista previa ${scheme}`, async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: scheme })
    const name = (n: string) => `${DIR}/${info.project.name}-${scheme}-${n}.png`
    const shoot = async (path: string, file: string) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(600)
      await page.screenshot({ path: name(file), fullPage: true })
    }
    await shoot('/', '1-portada')
    await shoot('/productos', '2-catalogo')
    await shoot('/productos/1', '3-detalle')
    await page.getByRole('button', { name: 'Agregar al carrito' }).click()
    await shoot('/carrito', '4-carrito')
  })
}
