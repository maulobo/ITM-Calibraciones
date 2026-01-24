import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Grid,
  LinearProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Avatar,
  Stack,
  useTheme,
  alpha,
  Container,
} from "@mui/material";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  Scale,
  Wrench,
  AlertOctagon,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

// Mock Data
const MOCK_INSTRUMENTS = [
  {
    id: 1,
    name: "Manómetro Digital",
    tag: "ITM-001",
    status: "VALID",
    nextCalibration: "2026-05-15",
    lastCalibration: "2025-05-15",
  },
  {
    id: 2,
    name: "Termómetro IR",
    tag: "ITM-042",
    status: "EXPIRING_SOON",
    nextCalibration: "2026-02-01",
    lastCalibration: "2025-02-01",
  },
  {
    id: 3,
    name: "Calibre Pie de Rey",
    tag: "ITM-105",
    status: "EXPIRED",
    nextCalibration: "2026-01-10",
    lastCalibration: "2025-01-10",
  },
  {
    id: 4,
    name: "Multímetro Fluke",
    tag: "ITM-099",
    status: "IN_PROCESS",
    nextCalibration: "-",
    lastCalibration: "2024-11-20",
  },
  {
    id: 5,
    name: "Balanza Analítica",
    tag: "ITM-150",
    status: "VALID",
    nextCalibration: "2026-06-20",
    lastCalibration: "2025-06-20",
  },
];

const MOCK_HISTORY = [
  {
    id: "ORD-001",
    date: "2025-12-10",
    instrument: "Manómetro Digital",
    tag: "ITM-001",
    type: "Calibración",
    result: "Aprobado",
  },
  {
    id: "ORD-002",
    date: "2025-11-05",
    instrument: "Termómetro IR",
    tag: "ITM-042",
    type: "Reparación",
    result: "Completado",
  },
  {
    id: "ORD-003",
    date: "2025-10-20",
    instrument: "Balanza Analítica",
    tag: "ITM-150",
    type: "Calibración",
    result: "Aprobado",
  },
];

const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case "VALID":
      return (
        <Chip
          label="Vigente"
          color="success"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: "medium",
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            border: "none",
          }}
          icon={<CheckCircle size={14} />}
        />
      );
    case "EXPIRING_SOON":
      return (
        <Chip
          label="Por Vencer"
          color="warning"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: "medium",
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            border: "none",
          }}
          icon={<Clock size={14} />}
        />
      );
    case "EXPIRED":
      return (
        <Chip
          label="Vencido"
          color="error"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: "medium",
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            border: "none",
          }}
          icon={<AlertTriangle size={14} />}
        />
      );
    case "IN_PROCESS":
      return (
        <Chip
          label="En Taller"
          color="info"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: "medium",
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
            border: "none",
          }}
          icon={<Activity size={14} />}
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const StatCard = ({
  title,
  value,
  total,
  color,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: number;
  total: number;
  color: "primary" | "success" | "warning" | "info" | "error";
  icon: any;
  subtitle: string;
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(theme.palette[color].main, 0.2),
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 4px 20px -5px ${alpha(theme.palette[color].main, 0.2)}`,
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} />
          </Box>
          <Chip
            label={subtitle}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].dark,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Stack>

        <Typography
          variant="h3"
          fontWeight="800"
          sx={{ mb: 0.5, color: theme.palette.text.primary }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="500"
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              borderRadius: 1,
              height: 6,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${total > 0 ? (value / total) * 100 : 0}%`,
                bgcolor: theme.palette[color].main,
                height: "100%",
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            color={theme.palette[color].main}
          >
            {total > 0 ? Math.round((value / total) * 100) : 0}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ClientDashboardPage = () => {
  const { user } = useAuthStore();
  const theme = useTheme();

  const stats = {
    total: MOCK_INSTRUMENTS.length,
    valid: MOCK_INSTRUMENTS.filter((i) => i.status === "VALID").length,
    attention: MOCK_INSTRUMENTS.filter((i) =>
      ["EXPIRED", "EXPIRING_SOON"].includes(i.status),
    ).length,
    inWorkshop: MOCK_INSTRUMENTS.filter((i) => i.status === "IN_PROCESS")
      .length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          mb: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              mb: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Panel de Control
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal">
            Bienvenido de nuevo,{" "}
            <Box component="span" fontWeight="bold" color="text.primary">
              {user?.name}
            </Box>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Wrench size={18} />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Solicitar Servicio
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Equipos"
            value={stats.total}
            total={stats.total}
            color="primary"
            icon={Scale}
            subtitle="Inventario"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Equipos Vigentes"
            value={stats.valid}
            total={stats.total}
            color="success"
            icon={CheckCircle}
            subtitle="Operativos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Atención Requerida"
            value={stats.attention}
            total={stats.total}
            color="warning"
            icon={AlertOctagon}
            subtitle="Vencimientos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Taller"
            value={stats.inWorkshop}
            total={stats.total}
            color="info"
            icon={Wrench}
            subtitle="Servicio"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Instruments List */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography variant="h6" fontWeight="700">
                Mis Instrumentos
              </Typography>
              <Button
                size="small"
                endIcon={<ChevronRight size={16} />}
                sx={{ fontWeight: 600 }}
              >
                Ver Todos
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      TAG / ID
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      INSTRUMENTO
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      VENCIMIENTO
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      ESTADO
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_INSTRUMENTS.map((inst) => (
                    <TableRow
                      key={inst.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="primary"
                        >
                          {inst.tag}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {inst.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {inst.nextCalibration}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <StatusChip status={inst.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity / History */}
        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Historial Reciente
            </Typography>
            <Button size="small">Ver historial</Button>
          </Box>
          <Stack spacing={2}>
            {MOCK_HISTORY.map((item) => (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "primary.50",
                      color: "primary.main",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FileText size={20} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.instrument}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <Typography variant="caption" color="text.disabled">
                        {item.date}
                      </Typography>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: "text.disabled",
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight="600"
                        color={
                          item.result === "Aprobado" ||
                          item.result === "Completado"
                            ? "success.main"
                            : "text.secondary"
                        }
                      >
                        {item.result}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
