import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  window.localStorage.clear()
})

afterAll(() => server.close())

// jsdom no implementa scrollTo ni matchMedia
window.scrollTo = () => undefined
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
})) as typeof window.matchMedia

// La app carga rutas con lazy loading y las pruebas corren en paralelo: 1 s es poco margen en un equipo cargado
configure({ asyncUtilTimeout: 4000 })
