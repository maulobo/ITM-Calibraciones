import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useTheme,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Calculator,
  Truck,
  Settings,
  ChevronLeft,
  Menu,
  Wrench,
  MapPinned,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const drawerWidth = 260;
const collapsedDrawerWidth = 70;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    text: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/dashboard",
  },
  {
    text: "Ordenes",
    icon: <ClipboardList size={22} />,
    path: "/service-orders",
  },
  { text: "Clientes", icon: <Users size={22} />, path: "/clients" },
  { text: "Oficinas", icon: <MapPinned size={22} />, path: "/offices" },
  { text: "Técnicos", icon: <Wrench size={22} />, path: "/technicians" },
  { text: "Inventario", icon: <Package size={22} />, path: "/inventory" },
  { text: "Presupuestos", icon: <Calculator size={22} />, path: "/budgets" },
  { text: "Logística", icon: <Truck size={22} />, path: "/logistics" },
  { text: "Configuración", icon: <Settings size={22} />, path: "/settings" },
];

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedDrawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedDrawerWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          backgroundColor: "background.paper", // Use theme variable
          borderRight: 1,
          borderColor: "divider", // Use theme variable
          boxShadow: open
            ? theme.palette.mode === "light"
              ? "4px 0 24px 0 rgba(0,0,0,0.02)"
              : "none"
            : "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          p: 2,
          height: 64,
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                ITM
              </Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Calibraciones
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && (
          <IconButton onClick={onToggle} size="small" sx={{ ml: open ? 0 : 0 }}>
            {open ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      <List sx={{ mt: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ display: "block", mb: 0.5 }}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  borderRadius: 2,
                  bgcolor: isActive
                    ? theme.palette.mode === "light"
                      ? "rgba(21, 101, 192, 0.08)"
                      : "rgba(90, 147, 237, 0.16)"
                    : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    bgcolor: isActive
                      ? theme.palette.mode === "light"
                        ? "rgba(21, 101, 192, 0.12)"
                        : "rgba(90, 147, 237, 0.24)"
                      : "action.hover",
                    color: isActive ? "primary.main" : "text.primary",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    display: open ? "block" : "none",
                    "& .MuiTypography-root": {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
