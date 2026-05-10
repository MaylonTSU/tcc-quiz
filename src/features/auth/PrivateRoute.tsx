import { Navigate, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/types/app.types'

interface PrivateRouteProps {
  allowedRoles: Role[]
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/nao-autorizado" replace />
  }

  return <Outlet />
}
