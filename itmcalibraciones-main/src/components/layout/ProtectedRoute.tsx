import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { UserRoles } from "../../modules/auth/types/authTypes";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  allowedRoles?: UserRoles[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuth, user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
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
