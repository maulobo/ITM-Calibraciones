import { useState } from "react";
import type { ReactNode } from "react";
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
  Collapse,
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
  ChevronDown,
  ChevronRight,
  Menu,
  Wrench,
  MapPinned,
  Tag,
  Settings2,
  Box as BoxIcon,
  List as ListIcon,
  ShieldCheck,
  FlaskConical,
  Building2,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const drawerWidth = 260;
const collapsedDrawerWidth = 70;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
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
  {
    text: "Equipos",
    icon: <FlaskConical size={22} />,
    path: "/equipments",
  },
  {
    text: "Clientes",
    icon: <Users size={22} />,
    children: [
      { text: "Empresas", icon: <Building2 size={20} />, path: "/clients" },
      { text: "Oficinas", icon: <MapPinned size={20} />, path: "/offices" },
      { text: "Contactos", icon: <User size={20} />, path: "/contacts" },
    ],
  },
  { text: "Técnicos", icon: <Wrench size={22} />, path: "/technicians" },
  {
    text: "Patrones",
    icon: <ShieldCheck size={22} />,
    path: "/standard-equipment",
  },
  { text: "Inventario", icon: <Package size={22} />, path: "/inventory" },
  { text: "Presupuestos", icon: <Calculator size={22} />, path: "/budgets" },
  { text: "Logística", icon: <Truck size={22} />, path: "/logistics" },
  {
    text: "Catálogo",
    icon: <ListIcon size={22} />,
    children: [
      { text: "Marcas", icon: <Tag size={20} />, path: "/params/brands" },
      { text: "Modelos", icon: <BoxIcon size={20} />, path: "/params/models" },
      { text: "Tipos", icon: <Settings2 size={20} />, path: "/params/types" },
    ],
  },
  { text: "Configuración", icon: <Settings size={22} />, path: "/settings" },
];

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("Clientes");

  const handleSubmenuToggle = (text: string) => {
    setOpenSubmenu(openSubmenu === text ? null : text);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isParent = !!item.children;
    const isExpanded = openSubmenu === item.text;
    const isActive =
      item.path === location.pathname ||
      item.children?.some((child) => child.path === location.pathname);

    return (
      <Box key={item.text}>
        <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              if (isParent) {
                if (!open) onToggle(); // Open sidebar if collapsed
                handleSubmenuToggle(item.text);
              } else {
                navigate(item.path!);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              borderRadius: 2,
              bgcolor:
                isActive && !isParent
                  ? theme.palette.mode === "light"
                    ? "rgba(21, 101, 192, 0.08)"
                    : "rgba(90, 147, 237, 0.16)"
                  : "transparent",
              color: isActive && !isParent ? "primary.main" : "text.secondary",
              "&:hover": {
                bgcolor:
                  isActive && !isParent
                    ? theme.palette.mode === "light"
                      ? "rgba(21, 101, 192, 0.12)"
                      : "rgba(90, 147, 237, 0.24)"
                    : "action.hover",
                color: isActive && !isParent ? "primary.main" : "text.primary",
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
            {isParent &&
              open &&
              (isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </ListItemButton>
        </ListItem>

        {isParent && (
          <Collapse in={open && isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => {
                const isChildActive = location.pathname === child.path;
                return (
                  <ListItemButton
                    key={child.text}
                    onClick={() => navigate(child.path!)}
                    sx={{
                      pl: 9, // Indent for submenu
                      minHeight: 40,
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isChildActive
                        ? theme.palette.mode === "light"
                          ? "rgba(21, 101, 192, 0.08)"
                          : "rgba(90, 147, 237, 0.16)"
                        : "transparent",
                      color: isChildActive ? "primary.main" : "text.secondary",
                      "&:hover": {
                        color: "text.primary",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        justifyContent: "center",
                        color: "inherit",
                        transform: "scale(0.9)",
                      }}
                    >
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={child.text}
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: isChildActive ? 600 : 400,
                          fontSize: "0.9rem",
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

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
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
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

      <List sx={{ mt: 1, px: 1 }}>{menuItems.map(renderMenuItem)}</List>
    </Drawer>
  );
};
