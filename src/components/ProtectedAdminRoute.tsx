import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin, type AdminRole } from '@/contexts/AdminContext';

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requiredRole?: AdminRole;
}

export const ProtectedAdminRoute = ({ children, requiredRole }: ProtectedAdminRouteProps) => {
  const { isAuthenticated, isLoading, currentUser } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (requiredRole && currentUser?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (currentUser?.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (currentUser?.role === 'admin') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
