import { useState } from "react";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const MainLayout = () => {
  const theme = useTheme();
  // Detectar si es pantalla mediana/pequeña (menor a md = 900px)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // En móvil, forzamos que el sidebar esté cerrado (solo iconos)
  const isSidebarCollapsed = isMobile ? false : sidebarOpen;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar open={isSidebarCollapsed} onToggle={toggleSidebar} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: "100%", // Flexible width
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Topbar sidebarOpen={isSidebarCollapsed} />
        {/* Toolbar spacer to push content below fixed AppBar */}
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
};
