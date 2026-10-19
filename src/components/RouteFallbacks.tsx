import { Box, CircularProgress } from '@mui/material'
import { useNavigate, useRouteError } from 'react-router-dom'
import { useT } from '@/i18n/i18n'
import { EmptyState } from './EmptyState'

export function RouteError() {
  const t = useT()
  const error = useRouteError()
  console.error('Error de ruta', error)
  return (
    <EmptyState
      title={t('Algo se marchitó')}
      description={t('No pudimos mostrar esta página. Vuelve al inicio e inténtalo de nuevo.')}
      actionLabel={t('Ir al inicio')}
      onAction={() => window.location.assign('/')}
    />
  )
}

export function NotFound() {
  const t = useT()
  const navigate = useNavigate()
  return (
    <EmptyState
      title={t('Página no encontrada')}
      description={t('La dirección que buscas no existe.')}
      actionLabel={t('Ir al inicio')}
      onAction={() => navigate('/')}
    />
  )
}

/** Mientras se descargan los módulos de la ruta inicial (lazy loading). */
export function HydrateSplash() {
  const t = useT()
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <CircularProgress aria-label={t('Cargando Bloom')} />
    </Box>
  )
}
