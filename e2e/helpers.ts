import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test'

export const PASSWORD = 'Passw0rd!'

export const uniqueEmail = (prefix = 'e2e') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@bloom.test`

/**
 * Guarda una captura numerada cuando E2E_SHOTS apunta a una carpeta (evidencia E4 para la entrega).
 * Sin la variable no hace nada.
 */
export async function shot(page: Page, info: TestInfo, name: string) {
  const dir = process.env.E2E_SHOTS
  if (!dir) return
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${dir}/${info.project.name}-${name}.png`, fullPage: true })
}

/** Registra un cliente por API y devuelve sus credenciales y su access token. */
export async function registerCustomer(request: APIRequestContext) {
  const email = uniqueEmail('api')
  const response = await request.post('/api/v1/auth/register', {
    data: { email, password: PASSWORD, fullName: 'Cliente E2E' },
  })
  expect(response.status()).toBe(201)
  const body = await response.json()
  return { email, token: body.accessToken as string }
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/productos$/)
}
