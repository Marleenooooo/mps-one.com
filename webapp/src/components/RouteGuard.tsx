import React from 'react';
import { Navigate } from 'react-router-dom';

type UserType = 'client' | 'supplier';

export function RouteGuard({
  requireUserType,
  requireRoleIn,
  fallbackTo = '/login/client',
  children,
}: {
  requireUserType?: UserType;
  requireRoleIn?: string[];
  fallbackTo?: string;
  children: React.ReactElement;
}) {
  try {
    const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
    const role = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);

    if (requireUserType && userType !== requireUserType) {
      return <Navigate to={fallbackTo} replace />;
    }
    if (Array.isArray(requireRoleIn) && requireRoleIn.length > 0) {
      if (!role || !requireRoleIn.includes(role)) {
        return <Navigate to={fallbackTo} replace />;
      }
    }
    return children;
  } catch {
    return <Navigate to={fallbackTo} replace />;
  }
}

