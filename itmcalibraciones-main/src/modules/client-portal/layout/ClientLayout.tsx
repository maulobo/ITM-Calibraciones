import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useColorMode } from "../../../theme/AppTheme";

export const ClientLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleColorMode, mode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
    >
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo area */}
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: "primary.main", fontWeight: "bold" }}
            >
              ITM Clientes
            </Typography>

            {/* User Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Oscuro"}>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                sx={{
                  display: { xs: "none", sm: "block" },
                  ml: 2,
                  mr: 1,
                  color: "text.primary",
                }}
              >
                Hola, {user?.name}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 32,
                    height: 32,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || <UserIcon size={18} />}
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
              >
                <MenuItem onClick={handleLogout}>
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
