import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { ServiceOrdersPage } from "../modules/service-orders/pages/ServiceOrdersPage";
import { ClientsPage } from "../modules/clients/pages/ClientsPage";
import { ClientDetailsPage } from "../modules/clients/pages/ClientDetailsPage";
import { OfficesPage } from "../modules/clients/pages/OfficesPage";
import { TechniciansPage } from "../modules/technicians/pages/TechniciansPage";
import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { RoleRedirect } from "../components/layout/RoleRedirect";
import { ClientLayout } from "../modules/client-portal/layout/ClientLayout";
import { ClientDashboardPage } from "../modules/client-portal/pages/ClientDashboardPage";
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
        index: true,
        element: <RoleRedirect />,
      },
      // Client Portal Routes
      {
        path: "/portal",
        element: <ClientLayout />,
        children: [
          {
            path: "",
            element: <ClientDashboardPage />,
          },
        ],
      },
      // Admin / Technical Routes
      {
        element: <MainLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/service-orders",
            element: <ServiceOrdersPage />,
          },
          {
            path: "/clients",
            element: <ClientsPage />,
          },
          {            path: "clients/:id",
            element: <ClientDetailsPage />,
          },
          {            path: "/offices",
            element: <OfficesPage />,
          },
          {
            path: "/technicians",
            element: <TechniciansPage />,
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
