import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  trend: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[8],
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}
      >
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: `${color}.main`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="h3"
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: 0.5 }}
        >
          {value}
        </Typography>

        <Typography
          color="text.secondary"
          variant="body1"
          fontWeight={500}
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: alpha(theme.palette.success.main, 0.08),
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          <TrendingUp size={14} color={theme.palette.success.main} />
          <Typography
            variant="caption"
            sx={{
              color: "success.main",
              fontWeight: 700,
            }}
          >
            {trend}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            vs mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Resumen general de las operaciones y estado del laboratorio.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ordenes Activas"
            value="24"
            icon={<Clock size={24} />}
            color="primary"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completadas (Mes)"
            value="156"
            icon={<CheckCircle size={24} />}
            color="success"
            trend="+5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Equipos por Vencer"
            value="8"
            icon={<AlertTriangle size={24} />}
            color="warning"
            trend="-2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos Totales"
            value="$45k"
            icon={<TrendingUp size={24} />}
            color="info"
            trend="+18%"
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Ordenes Recientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.default",
                borderRadius: 2,
                border: "1px dashed #e0e0e0",
              }}
            >
              <Typography color="text.secondary">
                Gráfico de Actividad Semanal
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Alertas del Sistema
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.default",
                borderRadius: 2,
                border: "1px dashed #e0e0e0",
              }}
            >
              <Typography color="text.secondary">Lista de Alertas</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
