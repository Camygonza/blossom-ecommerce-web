import { Alert, Snackbar } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastDismissed } from '@/features/ui/uiSlice'

/** Muestra un aviso a la vez, en orden de llegada. */
export function ToastHost() {
  const dispatch = useAppDispatch()
  const toast = useAppSelector((state) => state.ui.toasts[0])

  return (
    <Snackbar
      key={toast?.id}
      open={Boolean(toast)}
      autoHideDuration={4500}
      onClose={(_event, reason) => {
        if (toast && reason !== 'clickaway') dispatch(toastDismissed(toast.id))
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {toast ? (
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => dispatch(toastDismissed(toast.id))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
