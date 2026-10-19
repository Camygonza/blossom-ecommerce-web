import { defineConfig, devices } from '@playwright/test'

// Usa el Chrome instalado (PW_CHANNEL=chromium para el que descarga `npx playwright install chromium`, p. ej. en CI).
const channel = process.env.PW_CHANNEL ?? 'chrome'
// PW_BASE_URL apunta a un stack ya levantado (p. ej. docker compose en http://localhost:3000); sin ella se usa Vite en :5173.
const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:5173'

/**
 * E2E contra el api real: requiere el backend en http://localhost:8080 (docker compose del api o
 * `./mvnw spring-boot:run` con PostgreSQL). Vite se levanta solo y reenvía /api al backend.
 * Las pruebas inician sesión muchas veces desde la misma IP: arranca el api con LOGIN_RATE_LIMIT_MAX=1000 (el límite
 * por defecto es 10 intentos por minuto). Las pruebas crean sus propios datos (correos y productos únicos), así que se pueden repetir.
 */
export default defineConfig({
  testDir: './e2e',
  // base de datos compartida: un worker evita que dos pruebas compitan por el mismo stock
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'es',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // el video exige descargar ffmpeg (`npx playwright install ffmpeg`): solo si se pide con PW_VIDEO=retain-on-failure|on
    video: (process.env.PW_VIDEO as 'on' | 'retain-on-failure' | undefined) ?? 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel } },
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : { command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI },
})
