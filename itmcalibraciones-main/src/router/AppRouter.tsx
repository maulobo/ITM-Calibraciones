import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { ServiceOrdersPage } from "../modules/service-orders/pages/ServiceOrdersPage";
import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { Box, Typography } from "@mui/material";

// Placeholder generic page
const PlaceholderPage = ({ title }: { title: string }) => (
  <Box>
    <Typography variant="h4" fontWeight="bold">
      {title}
    </Typography>
    <Typography color="text.secondary">Página en construcción</Typography>
  </Box>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />, // Wrap protected routes
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/service-orders",
            element: <ServiceOrdersPage />,
          },
          {
            path: "/clients",
            element: <PlaceholderPage title="Clientes" />,
          },
          {
            path: "/inventory",
            element: <PlaceholderPage title="Inventario" />,
          },
          {
            path: "/budgets",
            element: <PlaceholderPage title="Presupuestos" />,
          },
          {
            path: "/logistics",
            element: <PlaceholderPage title="Logística" />,
          },
          {
            path: "/settings",
            element: <PlaceholderPage title="Configuración" />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
