import { Provider } from 'react-redux'
import { RouterProvider, type DataRouter } from 'react-router-dom'
import { ColorModeProvider } from '@/app/ColorModeProvider'
import type { AppStore } from '@/app/store'
import { I18nProvider } from '@/i18n/I18nProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionBootstrap } from '@/features/auth/SessionBootstrap'

interface AppProps {
  store: AppStore
  router: DataRouter
}

/** Raíz de la app. Store y router llegan de fuera para poder montarla igual en producción y en tests. */
function App({ store, router }: AppProps) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <ColorModeProvider>
            <SessionBootstrap>
              <RouterProvider router={router} />
            </SessionBootstrap>
          </ColorModeProvider>
        </Provider>
      </ErrorBoundary>
    </I18nProvider>
  )
}

export default App
