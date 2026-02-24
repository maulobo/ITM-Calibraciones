import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { ServiceOrdersPage } from "../modules/service-orders/pages/ServiceOrdersPage";
import { ClientsPage } from "../modules/clients/pages/ClientsPage";
import { ClientDetailsPage } from "../modules/clients/pages/ClientDetailsPage";
import { OfficesPage } from "../modules/clients/pages/OfficesPage";
import { OfficeDetailsPage } from "../modules/clients/pages/OfficeDetailsPage";
import { ContactsPage } from "../modules/clients/pages/ContactsPage";
import { ContactDetailsPage } from "../modules/clients/pages/ContactDetailsPage";
import { TechniciansPage } from "../modules/technicians/pages/TechniciansPage";
import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { RoleRedirect } from "../components/layout/RoleRedirect";
import { ClientLayout } from "../modules/client-portal/layout/ClientLayout";
import { ClientDashboardPage } from "../modules/client-portal/pages/ClientDashboardPage";
import { PortalOrdersPage } from "../modules/client-portal/pages/PortalOrdersPage";
import { PortalOrderDetailPage } from "../modules/client-portal/pages/PortalOrderDetailPage";
import { PortalEquipmentsPage } from "../modules/client-portal/pages/PortalEquipmentsPage";
import { PortalEquipmentDetailPage } from "../modules/client-portal/pages/PortalEquipmentDetailPage";
import { EquipmentTypesPage } from "../modules/catalog/pages/EquipmentTypesPage";
import { BrandsPage } from "../modules/catalog/pages/BrandsPage";
import { ModelsPage } from "../modules/catalog/pages/ModelsPage";
import { BrandModelsPage } from "../modules/catalog/pages/BrandModelsPage";
import { ModelDetailPage } from "../modules/catalog/pages/ModelDetailPage";
import { StandardEquipmentPage } from "../modules/standard-equipment/pages/StandardEquipmentPage";
import { StandardEquipmentDetailPage } from "../modules/standard-equipment/pages/StandardEquipmentDetailPage";
import { CreateServiceOrderPage } from "../modules/service-orders/pages/CreateServiceOrderPage";
import { ServiceOrderDetailPage } from "../modules/service-orders/pages/ServiceOrderDetailPage";
import { EquipmentsPage } from "../modules/equipments/pages/EquipmentsPage";
import { EquipmentDetailPage } from "../modules/equipments/pages/EquipmentDetailPage";
import { Box, Typography } from "@mui/material";
import { ProfilePage } from "../modules/users/pages/ProfilePage";

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
          { path: "",               element: <ClientDashboardPage /> },
          { path: "orders",         element: <PortalOrdersPage /> },
          { path: "orders/:id",     element: <PortalOrderDetailPage /> },
          { path: "equipment",      element: <PortalEquipmentsPage /> },
          { path: "equipment/:id",  element: <PortalEquipmentDetailPage /> },
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
            path: "/service-orders/:id",
            element: <ServiceOrderDetailPage />,
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
          { path: "/offices/:id", element: <OfficeDetailsPage /> },
          { path: "/contacts", element: <ContactsPage /> },
          { path: "/contacts/:id", element: <ContactDetailsPage /> },
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
            element: <ProfilePage />,
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
            path: "/params/brands/:brandId/models",
            element: <BrandModelsPage />,
          },
          {
            path: "/params/models",
            element: <ModelsPage />,
          },
          {
            path: "/params/models/:id",
            element: <ModelDetailPage />,
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
