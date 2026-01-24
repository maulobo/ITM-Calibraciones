import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { UserRoles } from "../../modules/auth/types/authTypes";

export const RoleRedirect = () => {
  const { user, isAuth } = useAuthStore();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  console.log(
    "RoleRedirect: Checking roles for user:",
    user?.email,
    user?.roles,
  );

  // Check for USER role (case insensitive safety)
  const isUser = user?.roles?.some(
    (r) =>
      r === UserRoles.USER ||
      (typeof r === "string" && r.toUpperCase() === "USER"),
  );

  if (isUser) {
    console.log("RoleRedirect: Redirecting to PORTAL");
    return <Navigate to="/portal" replace />;
  }

  // Default to admin dashboard for others
  console.log("RoleRedirect: Redirecting to DASHBOARD");
  return <Navigate to="/dashboard" replace />;
};
