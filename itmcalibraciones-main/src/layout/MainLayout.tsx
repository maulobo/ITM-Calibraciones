import { useState } from "react";
import { Box, Toolbar, LinearProgress, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isFetching = useIsFetching();

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
      {/* Global loading bar — thin stripe at the very top */}
      <LinearProgress
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 3,
          opacity: isFetching > 0 ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

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
