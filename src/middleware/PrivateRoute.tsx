// utils/PrivateRoute.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';

interface PrivateRouteProps {
  permissions?: string[]; // expected permission actions
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, permissions = [] }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const accessToken = localStorage.getItem('accessToken');
  const userPermissions: string[] = user?.role?.permissions?.map((p) => p.action) || [];

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  // No required permission match
  if (permissions.length > 0 && !permissions.some((perm) => userPermissions.includes(perm))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
