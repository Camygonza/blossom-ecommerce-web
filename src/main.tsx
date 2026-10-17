import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createAppRouter } from './app/router.tsx'
import { createStore } from './app/store.ts'

// Store y router se crean una sola vez fuera de React: createStore registra el listener de sesión y
// StrictMode ejecuta dos veces los inicializadores de hooks (dejaría el listener atado a otro store).
const store = createStore()
const router = createAppRouter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} router={router} />
  </StrictMode>,
)
