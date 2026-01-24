import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Bell,
  User,
  LogOut,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "../theme/AppTheme";
import { useAuthStore } from "../store/useAuthStore";

const drawerWidth = 260; // Must match Sidebar.tsx
const collapsedDrawerWidth = 70;

interface TopbarProps {
  sidebarOpen: boolean;
}

export const Topbar = ({ sidebarOpen }: TopbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toggleColorMode, mode } = useColorMode();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)`,
        ml: `${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px`,
        bgcolor: "background.paper",
        color: "text.primary",
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 600 }}
        >
          Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Oscuro"}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton size="large" color="inherit">
              <Badge badgeContent={3} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: "primary.main",
                fontSize: "0.9rem",
              }}
            >
              ML
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            disableScrollLock
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                mt: 1.5,
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">
                {user?.name || "Usuario"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || "usuario@correo.com"}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <User size={16} />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon size={16} />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogOut size={16} />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Need access to Divider, importing it here at the end is messy, let's fix imports
import { Divider } from "@mui/material";
