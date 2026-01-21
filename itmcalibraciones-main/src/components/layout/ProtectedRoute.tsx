import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { UserRoles } from "../../modules/auth/types/authTypes";

interface ProtectedRouteProps {
  allowedRoles?: UserRoles[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuth, user } = useAuthStore();
  const isLoading = false; // Zustand persistence is synchronous after initial load usually, or handled differently. for now assume loaded.

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    // Cast user.roles (string[]) to check against UserRoles enum
    const hasRequiredRole = user.roles.some((role: string) =>
      allowedRoles.includes(role as UserRoles),
    );
    if (!hasRequiredRole) {
      return <div>No tienes permisos para acceder a esta página.</div>;
    }
  }

  return <Outlet />;
};
