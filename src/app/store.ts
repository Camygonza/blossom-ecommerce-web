import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { api } from '@/api/api'
import { setSessionListener } from '@/api/session'
import authReducer, { sessionEnded, sessionStarted } from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  ui: uiReducer,
})

export function createStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(api.middleware),
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
