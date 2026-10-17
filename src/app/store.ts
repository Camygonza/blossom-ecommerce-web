import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { api } from '@/api/api'
import { setSessionListener } from '@/api/session'
import authReducer, { sessionEnded, sessionStarted } from '@/features/auth/authSlice'
import cartReducer, { loadCart, saveCart } from '@/features/cart/cartSlice'
import uiReducer from '@/features/ui/uiSlice'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
})

export function createStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  const store = configureStore({
    reducer: rootReducer,
    // el carrito sobrevive a recargas (D21)
    preloadedState: { cart: loadCart(), ...preloadedState },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  })

  let savedCart = store.getState().cart
  store.subscribe(() => {
    const { cart } = store.getState()
    if (cart !== savedCart) {
      savedCart = cart
      saveCart(cart)
    }
  })

  setSessionListener({
    onStarted: (auth) => store.dispatch(sessionStarted(auth.user)),
    onEnded: () => {
      store.dispatch(sessionEnded())
      // la caché pertenece al usuario anterior: se descarta al cerrar sesión
      store.dispatch(api.util.resetApiState())
    },
  })
  return store
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
