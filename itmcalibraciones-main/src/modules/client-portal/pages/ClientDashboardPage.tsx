import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Grid,
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
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Wrench,
  ChevronRight,
  ClipboardList,
  Eye,
  Building2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useMyProfile, extractClientId } from "../../users/hooks/useMyProfile";
import { useServiceOrdersByClient } from "../../service-orders/hooks/useServiceOrders";
import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceOrderStatus } from "../../service-orders/types";

// ─── Status config ────────────────────────────────────────────────────────────
const SO_STATUS: Record<ServiceOrderStatus, { label: string; color: "default" | "info" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Pendiente",  color: "default" },
  IN_PROCESS: { label: "En proceso", color: "info"    },
  FINISHED:   { label: "Terminado",  color: "success" },
  DELIVERED:  { label: "Entregado",  color: "warning" },
  CANCELLED:  { label: "Cancelado",  color: "error"   },
};

const StatusChip = ({ status }: { status: ServiceOrderStatus }) => {
  const s = SO_STATUS[status] ?? { label: status, color: "default" as const };
  return <Chip label={s.label} color={s.color} size="small" />;
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: number;
  total: number;
  color: "primary" | "success" | "warning" | "info" | "error";
  icon: React.ElementType;
  subtitle: string;
}

const KpiCard = ({ title, value, total, color, icon: Icon, subtitle }: KpiCardProps) => {
  const theme = useTheme();
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(theme.palette[color].main, 0.25),
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        transition: "transform 0.18s, box-shadow 0.18s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 24px -8px ${alpha(theme.palette[color].main, 0.25)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette[color].main, 0.12),
              color: theme.palette[color].main,
              display: "flex",
            }}
          >
            <Icon size={22} />
          </Box>
          <Chip
            label={subtitle}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].dark,
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 22,
            }}
          />
        </Stack>

        <Typography variant="h3" fontWeight={800} sx={{ mb: 0.25 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              borderRadius: 1,
              height: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${pct}%`,
                bgcolor: theme.palette[color].main,
                height: "100%",
                borderRadius: 1,
                transition: "width 0.6s ease",
              }}
            />
          </Box>
          <Typography variant="caption" fontWeight={700} color={theme.palette[color].main}>
            {pct}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ClientDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Get full profile with client reference
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const clientId = extractClientId(profile);

  // Extract company name
  const companyName = useMemo(() => {
    if (!profile) return "";
    if (typeof profile.client === "object" && profile.client?.socialReason) return profile.client.socialReason;
    if (typeof profile.office === "object" && typeof profile.office?.client === "object") {
      return profile.office.client?.socialReason ?? "";
    }
    return "";
  }, [profile]);

  // Fetch real service orders for this client
  const { data: serviceOrders = [], isLoading: isLoadingOrders } = useServiceOrdersByClient(clientId);

  // Stats derived from real data
  const stats = useMemo(() => {
    const total = serviceOrders.length;
    const inProcess = serviceOrders.filter((o) => o.generalStatus === "IN_PROCESS").length;
    const finished = serviceOrders.filter((o) => ["FINISHED", "DELIVERED"].includes(o.generalStatus)).length;
    const pending = serviceOrders.filter((o) => o.generalStatus === "PENDING").length;

    // Equipments in workshop (IN_LABORATORY o EXTERNAL — el cliente no distingue)
    const inWorkshop = serviceOrders
      .flatMap((o) => o.equipments ?? [])
      .filter((eq) => eq.logisticState === "IN_LABORATORY" || eq.logisticState === "EXTERNAL").length;

    return { total, inProcess, finished, pending, inWorkshop };
  }, [serviceOrders]);

  // Recent orders (last 8)
  const recentOrders = useMemo(() => serviceOrders.slice(0, 8), [serviceOrders]);

  // Equipment currently in workshop (deduplicated, IN_LABORATORY o EXTERNAL — el cliente no distingue)
  const workshopEquipment = useMemo(() => {
    const seen = new Set<string>();
    const result = [];
    for (const order of serviceOrders) {
      for (const eq of order.equipments ?? []) {
        if (eq.logisticState !== "IN_LABORATORY" && eq.logisticState !== "EXTERNAL") continue;
        const eqId = eq._id || eq.id;
        if (eqId && !seen.has(eqId)) {
          seen.add(eqId);
          result.push({ ...eq, orderCode: order.code, orderId: order._id });
        }
      }
    }
    return result;
  }, [serviceOrders]);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    try { return format(new Date(d), "dd MMM yyyy", { locale: es }); } catch { return d; }
  };

  const isLoading = isLoadingProfile || isLoadingOrders;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* ── Welcome ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {companyName || "Panel de Control"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido,{" "}
            <Box component="span" fontWeight={700} color="text.primary">
              {user?.name} {user?.lastName}
            </Box>{" "}
            · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ClipboardList size={17} />}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          onClick={() => navigate("/portal/orders")}
        >
          Ver Órdenes
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────────── */}
          <Grid container spacing={2.5} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Órdenes Totales" value={stats.total} total={stats.total} color="primary" icon={ClipboardList} subtitle="Historial" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="En Proceso" value={stats.inProcess} total={stats.total} color="info" icon={Activity} subtitle="Activas" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Finalizadas" value={stats.finished} total={stats.total} color="success" icon={CheckCircle} subtitle="Completadas" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Equipos en Taller" value={stats.inWorkshop} total={stats.inWorkshop || 1} color="warning" icon={Wrench} subtitle="En proceso" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* ── Recent Orders ────────────────────────────────────────── */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ClipboardList size={18} color={theme.palette.primary.main} />
                    <Typography variant="h6" fontWeight={700}>
                      Órdenes Recientes
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    endIcon={<ChevronRight size={15} />}
                    sx={{ fontWeight: 600, textTransform: "none" }}
                    onClick={() => navigate("/portal/orders")}
                  >
                    Ver todas
                  </Button>
                </Box>

                {recentOrders.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                    <Box sx={{ opacity: 0.15, mb: 2 }}><ClipboardList size={48} /></Box>
                    <Typography color="text.secondary">Sin órdenes de servicio aún</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{
                          "& th": { fontWeight: 700, fontSize: "0.75rem", color: "text.secondary",
                            textTransform: "uppercase", letterSpacing: 0.5 }
                        }}>
                          <TableCell>Código</TableCell>
                          <TableCell>Sucursal</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell align="center">Equipos</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow
                            key={order._id}
                            hover
                            sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                            onClick={() => navigate(`/portal/orders/${order._id}`)}
                          >
                            <TableCell>
                              <Chip
                                label={order.code}
                                size="small"
                                sx={{
                                  fontFamily: "monospace", fontWeight: 700, bgcolor: "action.selected",
                                  borderRadius: 1, height: 22, fontSize: "0.78rem",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.85rem" }}>
                              {order.office?.name ?? "—"}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={order.equipments?.length ?? 0} size="small" variant="outlined" sx={{ height: 20 }} />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={order.generalStatus} />
                            </TableCell>
                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="Ver orden">
                                <IconButton size="small" color="primary" onClick={() => navigate(`/portal/orders/${order._id}`)}>
                                  <Eye size={14} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* ── Equipment in Workshop ─────────────────────────────────── */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.warning.main, 0.03),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Wrench size={18} color={theme.palette.warning.main} />
                    <Typography variant="h6" fontWeight={700}>
                      En Taller
                    </Typography>
                    {workshopEquipment.length > 0 && (
                      <Chip
                        label={workshopEquipment.length}
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: "0.72rem", fontWeight: 700 }}
                      />
                    )}
                  </Box>
                </Box>

                {workshopEquipment.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                    <Box sx={{ opacity: 0.15, mb: 2 }}><Package size={48} /></Box>
                    <Typography color="text.secondary" variant="body2">
                      No hay equipos en taller actualmente
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={0} divider={<Divider />}>
                    {workshopEquipment.map((eq) => (
                      <Box
                        key={eq._id || eq.id}
                        sx={{
                          px: 3,
                          py: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          cursor: "pointer",
                          transition: "bgcolor 0.15s",
                          "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.04) },
                        }}
                        onClick={() => navigate(`/portal/orders/${eq.orderId}`)}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: "warning.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Wrench size={16} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} fontFamily="monospace" noWrap>
                            {eq.serialNumber || "—"}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                            {eq.tag && (
                              <Chip
                                label={eq.tag}
                                size="small"
                                sx={{ height: 18, fontSize: "0.68rem", borderRadius: 0.5, bgcolor: "action.selected" }}
                              />
                            )}
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {eq.range || ""}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={eq.orderCode}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: "monospace", fontSize: "0.7rem", height: 22, borderRadius: 1, flexShrink: 0 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};
