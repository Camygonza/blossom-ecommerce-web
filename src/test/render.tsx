import { render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import App from '@/App'
import { createTestRouter } from '@/app/router'
import { createStore } from '@/app/store'
import { endSession, startSession } from '@/api/session'
import type { AuthResponse } from '@/api/types'
import { formatMoney } from '@/lib/format'

interface Options {
  /** Sesión ya iniciada antes de montar (equivale a haberse logueado antes). */
  auth?: AuthResponse
}

/** Monta la app completa (store real, router en memoria, MSW como api) en la ruta indicada. */
export function renderApp(path = '/', { auth }: Options = {}) {
  endSession()
  const store = createStore()
  if (auth) {
    // deja el refresh token guardado y el access token en memoria, como tras iniciar sesión
    startSession(auth)
  }
  const router = createTestRouter([path])
  const utils = render(<App store={store} router={router} />)
  return { ...utils, store, router }
}

/** Ejecuta axe-core (WCAG 2.x A/AA) sobre el DOM actual y devuelve las violaciones. */
export async function accessibilityViolations(container: Element) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    // jsdom no calcula estilos reales: el contraste se revisa en el navegador (Playwright)
    rules: { 'color-contrast': { enabled: false } },
  })
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)
}

/** Consultas limitadas a la cabecera: el pie repite enlaces como «Carrito» o «Ingresar». */
export const header = () => ({
  getByRole: (...args: Parameters<typeof screen.getByRole>) =>
    within(screen.getByRole('banner')).getByRole(...args),
  findByRole: async (...args: Parameters<typeof screen.findByRole>) =>
    within(await screen.findByRole('banner')).findByRole(...args),
})

/** formatMoney con los espacios no separables como espacio normal, que es lo que ve Testing Library. */
export const money = (value: number) => formatMoney(value).replace(/ /g, ' ')
