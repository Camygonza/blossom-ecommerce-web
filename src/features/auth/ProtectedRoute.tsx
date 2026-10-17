import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/api/types'
import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/EmptyState'

/** Exige sesión (y opcionalmente un rol). Sin sesión lleva a /login recordando a dónde volver. */
export function ProtectedRoute({ role }: { role?: Role }) {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (role && user.role !== role) {
    return (
      <EmptyState
        title="Sin acceso"
        description="Tu cuenta no tiene permiso para ver esta página."
      />
    )
  }
  return <Outlet />
}
