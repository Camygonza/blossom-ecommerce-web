import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/api/types'

export interface AuthState {
  user: User | null
  /** 'restoring' mientras se intenta recuperar la sesión con el refresh token al arrancar. */
  status: 'restoring' | 'ready'
}

const initialState: AuthState = { user: null, status: 'restoring' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.status = 'ready'
    },
    sessionEnded(state) {
      state.user = null
      state.status = 'ready'
    },
    restoreFinished(state) {
      state.status = 'ready'
    },
  },
})

export const { sessionStarted, sessionEnded, restoreFinished } = authSlice.actions
export default authSlice.reducer
