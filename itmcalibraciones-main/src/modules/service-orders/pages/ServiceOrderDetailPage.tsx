import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Stack,
  Divider,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ArrowLeft,
  Eye,
  Calendar,
  Building2,
  User,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  XCircle,
  Truck,
  History,
} from "lucide-react";
import { useState, type ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  useServiceOrder,
  useUpdateServiceOrder,
} from "../hooks/useServiceOrders";
import { LogisticStateBadge } from "../../equipments/components/LogisticStateBadge";
import type { ServiceOrderStatus } from "../types";

// ── Configuración de estados ──────────────────────────────────────────────────
const statusConfig: Record<
  ServiceOrderStatus,
  { label: string; color: "default" | "primary" | "success" | "info" | "error" }
> = {
  PENDING:    { label: "Pendiente",  color: "default"  },
  IN_PROCESS: { label: "En Proceso", color: "primary"  },
  FINISHED:   { label: "Finalizada", color: "success"  },
  DELIVERED:  { label: "Entregada",  color: "info"     },
  CANCELLED:  { label: "Cancelada",  color: "error"    },
};

// Siguiente estado lógico (avance normal)
const NEXT_STATUS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  PENDING:    "IN_PROCESS",
  IN_PROCESS: "FINISHED",
  FINISHED:   "DELIVERED",
};

const NEXT_LABEL: Partial<Record<ServiceOrderStatus, string>> = {
  PENDING:    "Iniciar Proceso",
  IN_PROCESS: "Marcar como Finalizada",
  FINISHED:   "Registrar Entrega",
};

const NEXT_ICON: Partial<Record<ServiceOrderStatus, ReactElement>> = {
  PENDING:    <ArrowRight size={16} />,
  IN_PROCESS: <CheckCircle size={16} />,
  FINISHED:   <Truck size={16} />,
};

// Estados técnicos que se consideran "terminados" (habilitan cierre de OT)
const TERMINAL_STATES = [
  "CALIBRATED",
  "VERIFIED",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
  "RETURN_WITHOUT_CALIBRATION",
];

const technicalStateLabels: Record<
  string,
  { label: string; color: "default" | "warning" | "success" | "info" | "error" | "primary" }
> = {
  PENDING:                   { label: "Pendiente",          color: "warning" },
  IN_PROCESS:                { label: "En Proceso",         color: "primary" },
  BLOCKED:                   { label: "Frenado",            color: "error"   },
  CALIBRATED:                { label: "Calibrado",          color: "success" },
  VERIFIED:                  { label: "Verificado",         color: "info"    },
  MAINTENANCE:               { label: "Mantenimiento",      color: "success" },
  OUT_OF_SERVICE:            { label: "Fuera de Servicio",  color: "error"   },
  RETURN_WITHOUT_CALIBRATION:{ label: "Dev. sin Calibrar",  color: "default" },
};

// ── Componente ────────────────────────────────────────────────────────────────
export const ServiceOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<ServiceOrderStatus | null>(null);
  const [cancelDialog, setCancelDialog] = useState(false);

  const { data: order, isLoading, error } = useServiceOrder(id!);
  const updateMutation = useUpdateServiceOrder();

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (error || !order)
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">No se pudo cargar la orden de servicio.</Alert>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate("/service-orders")} sx={{ mt: 2 }}>
          Volver a Órdenes
        </Button>
      </Box>
    );

  const status = statusConfig[order.generalStatus] ?? { label: order.generalStatus, color: "default" as const };
  const nextStatus = NEXT_STATUS[order.generalStatus];

  // Calcular equipos no terminados (para bloquear FINISHED)
  const notReadyEquipments = order.equipments?.filter(
    (e) => !TERMINAL_STATES.includes(e.technicalState ?? "")
  ) ?? [];
  const canFinish = notReadyEquipments.length === 0;

  const total      = order.equipments?.length ?? 0;
  const calibrated = order.equipments?.filter((e) => TERMINAL_STATES.includes(e.technicalState ?? "")).length ?? 0;
  const progress   = total > 0 ? (calibrated / total) * 100 : 0;

  const isCancelled  = order.generalStatus === "CANCELLED";
  const isDelivered  = order.generalStatus === "DELIVERED";
  const canTransition = !isCancelled && !isDelivered;

  const handleConfirmTransition = () => {
    if (!confirmDialog) return;
    updateMutation.mutate(
      { id: order._id || order.id!, dto: { generalStatus: confirmDialog } },
      { onSuccess: () => setConfirmDialog(null) },
    );
  };

  const handleConfirmCancel = () => {
    updateMutation.mutate(
      { id: order._id || order.id!, dto: { generalStatus: "CANCELLED" } },
      { onSuccess: () => setCancelDialog(false) },
    );
  };

  // Tooltip de bloqueo para FINISHED
  const finishBlockReason =
    nextStatus === "FINISHED" && !canFinish
      ? `${notReadyEquipments.length} equipo(s) aún sin estado terminal`
      : "";

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate("/service-orders")} color="inherit" size="small">
          Volver
        </Button>
        <Divider orientation="vertical" flexItem />
        <Typography variant="h5" fontWeight="bold">{order.code}</Typography>
        <Chip label={status.label} color={status.color} size="small" />

        {/* Acciones de estado — lado derecho */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          {updateMutation.isPending && <CircularProgress size={16} />}

          {/* Botón de siguiente estado */}
          {nextStatus && canTransition && (
            <Tooltip title={finishBlockReason} arrow>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={NEXT_ICON[order.generalStatus]}
                  disabled={updateMutation.isPending || (nextStatus === "FINISHED" && !canFinish)}
                  onClick={() => setConfirmDialog(nextStatus)}
                  color={nextStatus === "DELIVERED" ? "info" : nextStatus === "FINISHED" ? "success" : "primary"}
                >
                  {NEXT_LABEL[order.generalStatus]}
                </Button>
              </span>
            </Tooltip>
          )}

          {/* Botón cancelar */}
          {canTransition && (
            <Tooltip title="Cancelar la orden">
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<XCircle size={16} />}
                  disabled={updateMutation.isPending}
                  onClick={() => setCancelDialog(true)}
                >
                  Cancelar OT
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Alerta de error de transición */}
      {updateMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => updateMutation.reset()}>
          {(updateMutation.error as any)?.response?.data?.message ?? "Error al actualizar la orden"}
        </Alert>
      )}

      {/* ── Info Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Building2 size={16} color="#64748b" />
              <Typography variant="caption" color="text.secondary" fontWeight="bold">CLIENTE</Typography>
            </Stack>
            <Typography variant="body1" fontWeight={600}>{order.client?.socialReason ?? "—"}</Typography>
            {order.client?.cuit && (
              <Typography variant="caption" color="text.secondary">CUIT: {order.client.cuit}</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Building2 size={16} color="#64748b" />
              <Typography variant="caption" color="text.secondary" fontWeight="bold">OFICINA / SUCURSAL</Typography>
            </Stack>
            <Typography variant="body1" fontWeight={600}>{order.office?.name ?? "—"}</Typography>
            {order.office?.address && (
              <Typography variant="caption" color="text.secondary">{order.office.address}</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <User size={16} color="#64748b" />
              <Typography variant="caption" color="text.secondary" fontWeight="bold">CONTACTO(S)</Typography>
            </Stack>
            {(order.contacts ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">—</Typography>
            ) : (
              (order.contacts ?? []).map((c, idx) => (
                <Box key={idx} sx={{ mb: idx < (order.contacts ?? []).length - 1 ? 1 : 0 }}>
                  <Typography variant="body1" fontWeight={600}>{c.name}</Typography>
                  {c.email && <Typography variant="caption" color="text.secondary" display="block">{c.email}</Typography>}
                  {c.phone && <Typography variant="caption" color="text.secondary">{c.phone}</Typography>}
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Calendar size={16} color="#64748b" />
              <Typography variant="caption" color="text.secondary" fontWeight="bold">FECHAS</Typography>
            </Stack>
            <Typography variant="body2">
              <strong>Ingreso:</strong>{" "}
              {format(new Date(order.entryDate ?? order.createdAt), "dd/MM/yyyy")}
            </Typography>
            {order.estimatedDeliveryDate && (
              <Typography variant="body2">
                <strong>Entrega est.:</strong>{" "}
                {format(new Date(order.estimatedDeliveryDate), "dd/MM/yyyy")}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Observaciones ── */}
      {order.observations && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "grey.50" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <ClipboardList size={16} color="#64748b" />
            <Typography variant="caption" color="text.secondary" fontWeight="bold">OBSERVACIONES</Typography>
          </Stack>
          <Typography variant="body2">{order.observations}</Typography>
        </Paper>
      )}

      {/* ── Progreso ── */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">Progreso de Calibración</Typography>
          <Typography variant="caption" color="text.secondary">
            {calibrated} de {total} equipos en estado terminal
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
          color={progress === 100 ? "success" : "primary"}
        />
        {nextStatus === "FINISHED" && !canFinish && (
          <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
            {notReadyEquipments.length} equipo(s) sin estado terminal — la orden no puede finalizarse aún.
          </Alert>
        )}
      </Paper>

      {/* ── Tabla de Equipos ── */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" fontWeight="bold">
            Equipos de esta Orden <Chip label={total} size="small" sx={{ ml: 1 }} />
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell>OT</TableCell>
                <TableCell>Marca / Modelo</TableCell>
                <TableCell>N° de Serie</TableCell>
                <TableCell>Rango</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Estado Técnico</TableCell>
                <TableCell>Estado Logístico</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.equipments?.filter(Boolean).map((eq) => {
                const eqId = eq._id || (eq as any).id;
                const techState = technicalStateLabels[eq.technicalState ?? ""] ?? {
                  label: eq.technicalState ?? "—",
                  color: "default" as const,
                };
                return (
                  <TableRow key={eqId || Math.random()} hover>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {eq.otCode ?? `${order.code}-${(eq.orderIndex ?? 0) + 1}`}
                      </Typography>
                      {(() => {
                        const entry = eq.serviceHistory?.find(
                          (h) => h.serviceOrder === order._id || h.serviceOrder === order.id,
                        );
                        return entry?.entryObservations ? (
                          <Typography
                            variant="caption"
                            color="warning.dark"
                            display="block"
                            sx={{ mt: 0.25, fontStyle: "italic", maxWidth: 160 }}
                          >
                            {entry.entryObservations}
                          </Typography>
                        ) : null;
                      })()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {eq.model?.brand?.name} {eq.model?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {eq.model?.equipmentType?.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">{eq.serialNumber ?? "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{eq.range ?? "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{eq.tag ?? "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={techState.label} color={techState.color} size="small" />
                      {eq.technicalState === "BLOCKED" && (() => {
                        const blockTypeLabel = {
                          BROKEN:                    "Roto",
                          NEEDS_PART:               "Requiere repuesto",
                          NEEDS_EXTERNAL_MAINTENANCE:"Mant. externo",
                          OTHER:                    "Otro",
                        }[(eq as any).blockType] ?? null;
                        return (
                          <>
                            {blockTypeLabel && (
                              <Chip
                                label={blockTypeLabel}
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ mt: 0.5, display: "flex", height: 20, fontSize: 10 }}
                              />
                            )}
                            {eq.blockReason && (
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25, maxWidth: 180, fontStyle: "italic" }}>
                                {eq.blockReason}
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <LogisticStateBadge state={eq.logisticState as any} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => eqId && navigate(`/equipments/${eqId}`)}
                        sx={{ color: "info.main" }}
                        title="Ver detalle del equipo"
                        disabled={!eqId}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!order.equipments || order.equipments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Esta orden no tiene equipos asociados.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Historial de Estados ── */}
      {(order.statusHistory ?? []).length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <History size={16} color="#64748b" />
            <Typography variant="subtitle2" fontWeight="bold">Historial de Estados</Typography>
          </Stack>
          <Stack spacing={1}>
            {[...(order.statusHistory ?? [])].reverse().map((entry, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.75,
                  borderBottom: idx < (order.statusHistory ?? []).length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                {entry.from ? (
                  <>
                    <Chip label={statusConfig[entry.from as ServiceOrderStatus]?.label ?? entry.from} size="small" variant="outlined" />
                    <ArrowRight size={14} color="#94a3b8" />
                  </>
                ) : null}
                <Chip
                  label={statusConfig[entry.to as ServiceOrderStatus]?.label ?? entry.to}
                  color={statusConfig[entry.to as ServiceOrderStatus]?.color ?? "default"}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                  {entry.changedByName ?? "—"}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 130, textAlign: "right" }}>
                  {entry.changedAt ? format(new Date(entry.changedAt), "dd/MM/yyyy HH:mm") : "—"}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* ── Dialog confirmación avance ── */}
      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar cambio de estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Confirmás el cambio de estado de{" "}
            <strong>{statusConfig[order.generalStatus]?.label}</strong> a{" "}
            <strong>{confirmDialog ? statusConfig[confirmDialog]?.label : ""}</strong>?
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)} disabled={updateMutation.isPending}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmTransition} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog cancelar OT ── */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancelar Orden de Trabajo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés cancelar la orden <strong>{order.code}</strong>?
            Esta acción es irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)} disabled={updateMutation.isPending}>Volver</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
