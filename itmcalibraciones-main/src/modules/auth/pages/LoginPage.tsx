import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  Link as MuiLink,
} from "@mui/material";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useLoginMutation } from "../hooks/useLoginMutation";
import type { LoginRequest } from "../types/authTypes";

// Esquema de validación (Zod)
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const LoginPage = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending, error } = useLoginMutation();

  const onSubmit = (data: LoginRequest) => {
    mutate(data);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Image/Gradient */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #001E3C 0%, #1565C0 100%)", // Degradado tecnológico
          color: "white",
          p: 6,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <Box sx={{ zIndex: 1, maxWidth: 500 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
            ITM Calibraciones
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.8, fontWeight: 300 }}>
            Gestión integral de laboratorios, servicios y equipos de alta
            precisión.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.paper",
          p: 4,
        }}
      >
        <Container maxWidth="xs">
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            elevation={0}
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  mb: 2,
                  mx: "auto",
                }}
              >
                ITM
              </Box>
              <Typography
                component="h1"
                variant="h4"
                fontWeight="bold"
                color="text.primary"
              >
                Bienvenido
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Ingresa tus credenciales para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                Credenciales inválidas o error de conexión
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ mt: 1, width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                autoComplete="email"
                autoFocus
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                  mb: 3,
                }}
              >
                <MuiLink
                  component={RouterLink}
                  to="#"
                  variant="body2"
                  sx={{
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isPending}
                sx={{
                  py: 1.5,
                  mt: 2,
                  fontSize: "1rem",
                  textTransform: "none",
                  mb: 3,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  boxShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "0 4px 6px -1px rgba(21, 101, 192, 0.4)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
                }}
              >
                {isPending ? "Ingresando..." : "Iniciar Sesión"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{" "}
                  <MuiLink
                    component={RouterLink}
                    to="#"
                    sx={{
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Contactar soporte
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};
