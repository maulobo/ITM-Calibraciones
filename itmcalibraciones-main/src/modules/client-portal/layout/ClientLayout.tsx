import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Avatar,
  useTheme,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import { LogOut, User as UserIcon, Sun, Moon, LayoutDashboard, ClipboardList, Wrench } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useColorMode } from "../../../theme/AppTheme";

const NAV_ITEMS = [
  { label: "Dashboard",    path: "/portal",           icon: LayoutDashboard },
  { label: "Mis Órdenes",  path: "/portal/orders",    icon: ClipboardList   },
  { label: "Mis Equipos",  path: "/portal/equipment", icon: Wrench          },
];

export const ClientLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { toggleColorMode, mode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine active tab: check from most specific first
  const tabValue = NAV_ITEMS.reduce((acc, item, idx) => {
    if (location.pathname === item.path || location.pathname.startsWith(item.path + "/")) {
      return idx;
    }
    return acc;
  }, 0);

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* ── Top AppBar ─────────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          top: 0,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 56 }}>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: "primary.main", fontWeight: 800, letterSpacing: "-0.3px" }}
            >
              ITM Calibraciones
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Oscuro"}>
                <IconButton onClick={toggleColorMode} size="small">
                  {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" }, mx: 1 }}
              >
                {user?.name} {user?.lastName}
              </Typography>

              <Tooltip title="Opciones de cuenta">
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Avatar
                    sx={{ bgcolor: theme.palette.primary.main, width: 30, height: 30, fontSize: "0.85rem", fontWeight: 700 }}
                  >
                    {user?.name?.[0]?.toUpperCase() || <UserIcon size={16} />}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogOut size={15} style={{ marginRight: 8 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>

        {/* ── Nav Tabs ─────────────────────────────────────────────────── */}
        <Box sx={{ borderTop: 1, borderColor: "divider" }}>
          <Container maxWidth="xl">
            <Tabs
              value={tabValue}
              onChange={(_, v) => navigate(NAV_ITEMS[v].path)}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                minHeight: 44,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minHeight: 44,
                  py: 0,
                },
              }}
            >
              {NAV_ITEMS.map(({ label, icon: Icon }) => (
                <Tab
                  key={label}
                  label={label}
                  icon={<Icon size={15} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Container>
        </Box>
      </AppBar>

      {/* Explicit bg ensures dark mode color applies even before page-level bgcolor */}
      <Box sx={{ bgcolor: "background.default", flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
