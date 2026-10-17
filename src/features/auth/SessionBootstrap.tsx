import { Box, CircularProgress } from '@mui/material'
import { useEffect, type ReactNode } from 'react'
import { getRefreshToken, refreshSession } from '@/api/session'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { restoreFinished } from './authSlice'

/** Al arrancar intenta recuperar la sesión con el refresh token y solo entonces muestra la app (evita parpadeos de login). */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    if (!getRefreshToken()) {
      dispatch(restoreFinished())
      return
    }
    void refreshSession().finally(() => dispatch(restoreFinished()))
  }, [dispatch])

  if (status === 'restoring') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Cargando Bloom" />
      </Box>
    )
  }
  return children
}
