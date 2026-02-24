import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import { ArrowLeft, Building2, Calendar, Eye, FileText, MapPin, MessageSquare, Wrench } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useServiceOrder } from "../../service-orders/hooks/useServiceOrders";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceOrderStatus } from "../../service-orders/types";

const SO_STATUS: Record<ServiceOrderStatus, { label: string; color: "default" | "info" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Pendiente",  color: "default" },
  IN_PROCESS: { label: "En proceso", color: "info"    },
  FINISHED:   { label: "Terminado",  color: "success" },
  DELIVERED:  { label: "Entregado",  color: "warning" },
  CANCELLED:  { label: "Cancelado",  color: "error"   },
};

const LOGISTIC_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  RECEIVED:        { label: "Recibido",          color: "primary"  },
  IN_LABORATORY:   { label: "En laboratorio",    color: "warning"  },
  EXTERNAL:        { label: "En externo",        color: "warning"  },
  ON_HOLD:         { label: "En espera",         color: "error"    },
  READY_TO_DELIVER:{ label: "Listo para retirar",color: "success"  },
  DELIVERED:       { label: "Entregado",         color: "default"  },
};

const TECHNICAL_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  PENDING:                    { label: "Pendiente",      color: "default" },
  IN_PROCESS:                 { label: "En proceso",     color: "warning" },
  CALIBRATED:                 { label: "Calibrado",      color: "success" },
  VERIFIED:                   { label: "Verificado",     color: "success" },
  MAINTENANCE:                { label: "Mantenimiento",  color: "success" },
  OUT_OF_SERVICE:             { label: "Fuera de servicio", color: "error" },
  RETURN_WITHOUT_CALIBRATION: { label: "Devolución",    color: "error"   },
};

const formatDate = (d?: string) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd 'de' MMMM yyyy", { locale: es }); } catch { return d; }
};

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Box sx={{ display: "flex", gap: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>
      {label}
    </Typography>
    <Box sx={{ flexGrow: 1 }}>
      {typeof value === "string"
        ? <Typography variant="body2" fontWeight={500}>{value || "—"}</Typography>
        : value ?? <Typography variant="body2" color="text.disabled">—</Typography>
      }
    </Box>
  </Box>
);

export const PortalOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useServiceOrder(id!);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Orden no encontrada</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/portal/orders")} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  const status = SO_STATUS[order.generalStatus] ?? { label: order.generalStatus, color: "default" as const };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowLeft size={15} />}
        onClick={() => navigate("/portal/orders")}
        size="small"
        sx={{ mb: 2.5, color: "text.secondary", textTransform: "none", fontWeight: 500, p: 0, minWidth: "auto", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
        disableRipple
      >
        Volver a Órdenes
      </Button>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3,
          border: "1px solid", borderColor: "divider",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={800} fontFamily="monospace" letterSpacing="-0.5px">
                {order.code}
              </Typography>
              <Chip label={status.label} color={status.color} size="medium" />
            </Box>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5, color: "text.secondary" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Calendar size={14} />
                <Typography variant="body2">Ingreso: {formatDate(order.createdAt)}</Typography>
              </Box>
              {order.office?.name && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Building2 size={14} />
                  <Typography variant="body2">{order.office.name}</Typography>
                </Box>
              )}
              {order.estimatedDeliveryDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={14} />
                  <Typography variant="body2">Entrega est.: {formatDate(order.estimatedDeliveryDate)}</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, textAlign: "center", borderRadius: 2, border: "1px solid", borderColor: "divider", minWidth: 80 }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">{order.equipments?.length ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>Equipos</Typography>
            </Paper>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* ── Info Panel ──────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FileText size={16} color="#64748b" />
              <Typography fontWeight={700} variant="subtitle1">Información</Typography>
            </Box>

            <InfoRow label="Código" value={<Typography fontFamily="monospace" fontWeight={700} variant="body2">{order.code}</Typography>} />
            <InfoRow label="Estado" value={<Chip label={status.label} color={status.color} size="small" />} />
            <InfoRow label="Sucursal" value={order.office?.name} />
            <InfoRow label="Fecha de ingreso" value={formatDate(order.createdAt)} />
            <InfoRow label="Entrega estimada" value={formatDate(order.estimatedDeliveryDate)} />

            {order.observations && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <MessageSquare size={14} color="#64748b" />
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Observaciones
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {order.observations}
                </Typography>
              </Box>
            )}

            {order.contacts && order.contacts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} sx={{ display: "block", mb: 1 }}>
                  Contactos
                </Typography>
                {order.contacts.map((c, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                    {c.email && <Typography variant="caption" color="text.secondary">{c.email}</Typography>}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Equipment Table ──────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
              <Wrench size={16} color="#64748b" />
              <Typography fontWeight={700} variant="subtitle1">
                Equipos ({order.equipments?.length ?? 0})
              </Typography>
            </Box>

            {!order.equipments || order.equipments.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Box sx={{ opacity: 0.15, mb: 2 }}><Wrench size={48} /></Box>
                <Typography color="text.secondary">Sin equipos en esta orden</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                      <TableCell>N° Serie</TableCell>
                      <TableCell>Tag</TableCell>
                      <TableCell>Rango</TableCell>
                      <TableCell>Estado Logístico</TableCell>
                      <TableCell>Estado Técnico</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.equipments.map((eq) => {
                      const logistic = eq.logisticState ? (LOGISTIC_LABELS[eq.logisticState] ?? { label: eq.logisticState, color: "default" as const }) : null;
                      const technical = eq.technicalState ? (TECHNICAL_LABELS[eq.technicalState] ?? { label: eq.technicalState, color: "default" as const }) : null;
                      return (
                        <TableRow
                          key={eq._id || eq.id}
                          hover
                          sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                          onClick={() => navigate(`/portal/equipment/${eq._id || eq.id}`)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                              {eq.serialNumber || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {eq.tag
                              ? <Chip label={eq.tag} size="small" sx={{ borderRadius: 1, height: 22, bgcolor: "action.selected", fontWeight: 500, fontSize: "0.75rem" }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>
                            }
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                            {eq.range || "—"}
                          </TableCell>
                          <TableCell>
                            {logistic
                              ? <Chip label={logistic.label} color={logistic.color} size="small" />
                              : <Typography variant="caption" color="text.disabled">—</Typography>
                            }
                          </TableCell>
                          <TableCell>
                            {technical
                              ? <Chip label={technical.label} color={technical.color} size="small" variant="outlined" />
                              : <Typography variant="caption" color="text.disabled">—</Typography>
                            }
                          </TableCell>
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Ver equipo">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/portal/equipment/${eq._id || eq.id}`)}
                              >
                                <Eye size={14} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
