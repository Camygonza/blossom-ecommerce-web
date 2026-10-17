import { Box, CircularProgress } from '@mui/material'
import { useNavigate, useRouteError } from 'react-router-dom'
import { EmptyState } from './EmptyState'

export function RouteError() {
  const error = useRouteError()
  console.error('Error de ruta', error)
  return (
    <EmptyState
      title="Algo se marchitó"
      description="No pudimos mostrar esta página. Vuelve al inicio e inténtalo de nuevo."
      actionLabel="Ir al inicio"
      onAction={() => window.location.assign('/')}
    />
  )
}

export function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      title="Página no encontrada"
      description="La dirección que buscas no existe."
      actionLabel="Ir al inicio"
      onAction={() => navigate('/')}
    />
  )
}

/** Mientras se descargan los módulos de la ruta inicial (lazy loading). */
export function HydrateSplash() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <CircularProgress aria-label="Cargando Bloom" />
    </Box>
  )
}
