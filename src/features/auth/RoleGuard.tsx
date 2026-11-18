import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from '@/types';

export function RoleGuard({
  allow,
  children,
  fallback,
}: {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return <>{fallback ?? <Navigate to="/dashboard" replace />}</>;
  }
  return <>{children}</>;
}
