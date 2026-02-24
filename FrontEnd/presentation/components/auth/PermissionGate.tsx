import React from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import UnauthorizedPage from '@/presentation/pages/UnauthorizedPage';

interface PermissionGateProps {
  requiredPermission: string;
  children: React.ReactNode;
  /** If true, always allow access (used for pages like Profile that everyone can see) */
  alwaysAllow?: boolean;
  /** If true, only admin users (SA/GM) are allowed */
  adminOnly?: boolean;
}

/**
 * Wraps page content and checks the user's permissions array.
 * If the user has the wildcard "*" permission (platform admin), they pass all checks.
 * If the permission is missing, the <UnauthorizedPage /> is rendered instead.
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  requiredPermission,
  children,
  alwaysAllow,
  adminOnly,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Layout loading state handles this
  }

  if (alwaysAllow) {
    return <>{children}</>;
  }

  if (adminOnly && !user?.isAdmin) {
    return <UnauthorizedPage />;
  }

  if (!requiredPermission) {
    return <>{children}</>;
  }

  const permissions = user?.permissions || [];
  const hasAccess =
    permissions.includes('*') ||
    permissions.includes('*:*:*') ||
    permissions.includes(requiredPermission);

  if (!hasAccess) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export default PermissionGate;
