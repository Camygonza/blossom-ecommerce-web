import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  severity: ToastSeverity
}

interface UiState {
  toasts: Toast[]
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] } as UiState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(message: string, severity: ToastSeverity = 'info') {
        return { payload: { id: nanoid(), message, severity } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { toastShown, toastDismissed } = uiSlice.actions
export default uiSlice.reducer
