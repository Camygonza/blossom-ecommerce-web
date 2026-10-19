import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/api/types'
import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/EmptyState'
import { useT } from '@/i18n/i18n'

/** Exige sesión (y opcionalmente un rol). Sin sesión lleva a /login recordando a dónde volver. */
export function ProtectedRoute({ role }: { role?: Role }) {
  const t = useT()
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (role && user.role !== role) {
    return (
      <EmptyState
        title={t('Sin acceso')}
        description={t('Tu cuenta no tiene permiso para ver esta página.')}
      />
    )
  }
  return <Outlet />
}
