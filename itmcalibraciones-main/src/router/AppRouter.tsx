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
import { EquipmentTypesPage } from "../modules/catalog/pages/EquipmentTypesPage";
import { BrandsPage } from "../modules/catalog/pages/BrandsPage";
import { ModelsPage } from "../modules/catalog/pages/ModelsPage";
import { StandardEquipmentPage } from "../modules/standard-equipment/pages/StandardEquipmentPage";
import { StandardEquipmentDetailPage } from "../modules/standard-equipment/pages/StandardEquipmentDetailPage";
import { CreateServiceOrderPage } from "../modules/service-orders/pages/CreateServiceOrderPage";
import { EquipmentsPage } from "../modules/equipments/pages/EquipmentsPage";
import { EquipmentDetailPage } from "../modules/equipments/pages/EquipmentDetailPage";
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
            path: "/service-orders/new",
            element: <CreateServiceOrderPage />,
          },
          {
            path: "/equipments",
            element: <EquipmentsPage />,
          },
          {
            path: "/equipments/:id",
            element: <EquipmentDetailPage />,
          },
          {
            path: "/clients",
            element: <ClientsPage />,
          },
          { path: "clients/:id", element: <ClientDetailsPage /> },
          { path: "/offices", element: <OfficesPage /> },
          {
            path: "/technicians",
            element: <TechniciansPage />,
          },
          {
            path: "/standard-equipment",
            element: <StandardEquipmentPage />,
          },
          {
            path: "/standard-equipment/:id",
            element: <StandardEquipmentDetailPage />,
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
          {
            path: "/params/types",
            element: <EquipmentTypesPage />,
          },
          {
            path: "/params/brands",
            element: <BrandsPage />,
          },
          {
            path: "/params/models",
            element: <ModelsPage />,
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
