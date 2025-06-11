"use client"

import React from 'react';
import { useAuthorization, usePermissions } from '@/lib/opa-client';

interface AuthorizedComponentProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoader?: boolean;
}

/**
 * Component that conditionally renders children based on OPA authorization
 */
export function AuthorizedComponent({ 
  resource, 
  action, 
  children, 
  fallback = null,
  showLoader = true 
}: AuthorizedComponentProps) {
  const { isAuthorized, isLoading, error } = useAuthorization(resource, action);

  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    console.warn(`Authorization error for ${resource}:${action}:`, error);
    return fallback;
  }

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}

interface PermissionGuardProps {
  resource: string;
  children: (permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  }) => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that provides permission context to children
 */
export function PermissionGuard({ 
  resource, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { permissions, isLoading, error } = usePermissions(resource);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !permissions) {
    return <>{fallback}</>;
  }

  return <>{children(permissions)}</>;
}

interface RoleBasedProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simple role-based component (for backward compatibility)
 */
export function RoleBased({ allowedRoles, children, fallback = null }: RoleBasedProps) {
  // This would typically use your existing auth context
  // For now, we'll use a simple implementation
  const userRoles = ['manager']; // This should come from your auth context
  
  const hasPermission = allowedRoles.some(role => userRoles.includes(role));
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component for wrapping entire pages with authorization
 */
export function withAuthorization<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: string,
  action: string,
  fallback?: React.ReactNode
) {
  return function AuthorizedPage(props: P) {
    return (
      <AuthorizedComponent 
        resource={resource} 
        action={action} 
        fallback={fallback || <div>Access Denied</div>}
      >
        <WrappedComponent {...props} />
      </AuthorizedComponent>
    );
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionCheck(resource: string, action: string) {
  const { isAuthorized, isLoading, error } = useAuthorization(resource, action);
  
  return {
    canAccess: isAuthorized,
    isLoading,
    error,
    // Helper functions
    canRead: () => useAuthorization(resource, 'read').isAuthorized,
    canWrite: () => useAuthorization(resource, 'write').isAuthorized,
    canDelete: () => useAuthorization(resource, 'delete').isAuthorized,
  };
} 