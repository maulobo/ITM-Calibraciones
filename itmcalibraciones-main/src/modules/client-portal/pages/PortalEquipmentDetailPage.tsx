import { useState } from "react";
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
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowLeft,
  Wrench,
  Tag,
  Activity,
  Calendar,
  Award,
  ClipboardList,
  CheckCircle,
  PackageX,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEquipmentById, useClientRequestReturn } from "../../equipments/hooks/useEquipments";
import { useBudgetsByEquipment } from "../../budgets/hooks/useBudgets";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const LOGISTIC_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  RECEIVED:        { label: "Recibido",          color: "primary"  },
  IN_LABORATORY:   { label: "En laboratorio",    color: "warning"  },
  EXTERNAL:        { label: "En laboratorio",    color: "warning"  }, // interno — el cliente no ve "En externo"
  ON_HOLD:         { label: "En espera",         color: "error"    },
  READY_TO_DELIVER:{ label: "Listo para retirar",color: "success"  },
  DELIVERED:       { label: "Entregado",         color: "default"  },
};

const TECHNICAL_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  PENDING:                    { label: "Pendiente",         color: "default" },
  IN_PROCESS:                 { label: "En proceso",        color: "warning" },
  BLOCKED:                    { label: "Frenado",           color: "warning" },
  CALIBRATED:                 { label: "Calibrado",         color: "success" },
  VERIFIED:                   { label: "Verificado",        color: "success" },
  MAINTENANCE:                { label: "Mantenimiento",     color: "success" },
  OUT_OF_SERVICE:             { label: "Fuera de servicio", color: "error"   },
  RETURN_WITHOUT_CALIBRATION: { label: "Devolución",        color: "error"   },
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  BROKEN:                     "Equipo roto / no funciona",
  NEEDS_PART:                 "Requiere repuesto",
  NEEDS_EXTERNAL_MAINTENANCE: "Requiere mantenimiento externo",
  OTHER:                      "Otro motivo",
};

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yyyy", { locale: es }); } catch { return d; }
};

const formatDateLong = (d?: string | null) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd 'de' MMMM yyyy", { locale: es }); } catch { return d; }
};

const InfoItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Box>
      {typeof value === "string"
        ? <Typography variant="body2" fontWeight={600}>{value || "—"}</Typography>
        : value ?? <Typography variant="body2" color="text.disabled">—</Typography>
      }
    </Box>
  </Box>
);

export const PortalEquipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: equipment, isLoading } = useEquipmentById(id);
  const returnMutation = useClientRequestReturn();
  const { data: linkedBudgets = [] } = useBudgetsByEquipment(equipment?._id);
  const [returnOpen, setReturnOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Equipo no encontrado</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/portal/equipment")} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  const logistic = equipment.logisticState ? (LOGISTIC_LABELS[equipment.logisticState] ?? { label: equipment.logisticState, color: "default" as const }) : null;
  const technical = equipment.technicalState ? (TECHNICAL_LABELS[equipment.technicalState] ?? { label: equipment.technicalState, color: "default" as const }) : null;

  // Service history sorted by entryDate desc
  const serviceHistory = [...(equipment.serviceHistory ?? [])].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );

  // Calibration records (entries that have calibrationDate)
  const calibrations = serviceHistory.filter((h) => h.calibrationDate);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowLeft size={15} />}
        onClick={() => navigate(-1)}
        size="small"
        sx={{ mb: 2.5, color: "text.secondary", textTransform: "none", fontWeight: 500, p: 0, minWidth: "auto", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
        disableRipple
      >
        Volver
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
              <Box
                sx={{
                  p: 1, borderRadius: 2, bgcolor: "primary.50",
                  color: "primary.main", display: "flex",
                }}
              >
                <Wrench size={20} />
              </Box>
              <Typography variant="h5" fontWeight={800} fontFamily="monospace">
                {equipment.serialNumber}
              </Typography>
              {equipment.tag && (
                <Chip label={equipment.tag} size="small" icon={<Tag size={12} />} sx={{ height: 24, fontWeight: 600 }} />
              )}
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1, mt: 1 }}>
              {equipment.model?.equipmentType?.type && (
                <Typography variant="body2" color="text.secondary">
                  {equipment.model.equipmentType.type}
                </Typography>
              )}
              {equipment.model?.brand?.name && (
                <>
                  <Typography variant="body2" color="text.disabled">·</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipment.model.brand.name}
                  </Typography>
                </>
              )}
              {equipment.model?.name && (
                <>
                  <Typography variant="body2" color="text.disabled">·</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipment.model.name}
                  </Typography>
                </>
              )}
              {equipment.range && (
                <>
                  <Typography variant="body2" color="text.disabled">·</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rango: {equipment.range}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>

          {/* State chips */}
          <Stack spacing={1} alignItems="flex-end">
            {logistic && <Chip label={logistic.label} color={logistic.color} size="medium" />}
            {technical && <Chip label={technical.label} color={technical.color} size="small" variant="outlined" />}
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* ── Details ─────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Activity size={16} color="#64748b" />
              <Typography fontWeight={700} variant="subtitle1">Estado actual</Typography>
            </Box>
            <InfoItem label="Estado logístico" value={logistic ? <Chip label={logistic.label} color={logistic.color} size="small" /> : undefined} />
            <InfoItem label="Estado técnico" value={technical ? <Chip label={technical.label} color={technical.color} size="small" variant="outlined" /> : undefined} />
            <InfoItem label="Ubicación" value={equipment.location === "ITM" || equipment.location === "EXTERNAL" ? "En laboratorio ITM" : undefined} />

            {equipment.technicalState === "BLOCKED" && linkedBudgets.length > 0 && linkedBudgets.map((b: any) => {
              const isPending  = b.status === "PENDING";
              const isApproved = b.status === "APPROVED";
              const code = b.code ?? `${String(b.year).slice(-2)}-${String(b.number).padStart(5, "0")}`;
              return (
                <Alert
                  key={b._id}
                  severity={isPending ? "info" : isApproved ? "success" : "warning"}
                  sx={{ mt: 2, borderRadius: 2 }}
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap" }}
                      onClick={() => navigate(`/portal/budgets/${b._id}`)}
                    >
                      {isPending ? "Ver y aprobar" : "Ver presupuesto"}
                    </Button>
                  }
                >
                  <Typography variant="body2" fontWeight={700}>
                    {isPending  && `Presupuesto ${code} pendiente de tu aprobación`}
                    {isApproved && `Presupuesto ${code} aprobado ✓`}
                    {b.status === "REJECTED" && `Presupuesto ${code} rechazado`}
                  </Typography>
                </Alert>
              );
            })}

            {equipment.technicalState === "BLOCKED" && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontSize: "0.82rem" }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Equipo frenado
                </Typography>
                {equipment.blockType && (
                  <Typography variant="body2">
                    {BLOCK_TYPE_LABELS[equipment.blockType] ?? equipment.blockType}
                  </Typography>
                )}
                {equipment.blockReason && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                    {equipment.blockReason}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  El laboratorio se comunicará con usted a la brevedad.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<PackageX size={14} />}
                  onClick={() => setReturnOpen(true)}
                  sx={{ mt: 1.5, fontWeight: 600, fontSize: "0.78rem" }}
                >
                  Solicitar devolución sin calibrar
                </Button>
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Calendar size={16} color="#64748b" />
              <Typography fontWeight={700} variant="subtitle1">Calibración</Typography>
            </Box>
            <InfoItem label="Última calibración" value={formatDateLong(equipment.calibrationDate)} />
            <InfoItem label="N° Certificado" value={equipment.certificateNumber} />

            {equipment.office?.name && (
              <>
                <Divider sx={{ my: 2 }} />
                <InfoItem label="Sucursal" value={equipment.office.name} />
              </>
            )}
          </Paper>
        </Grid>

        {/* ── Calibration History ─────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Calibrations */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                <Award size={16} color="#64748b" />
                <Typography fontWeight={700} variant="subtitle1">
                  Historial de Calibraciones
                </Typography>
                {calibrations.length > 0 && (
                  <Chip label={calibrations.length} size="small" color="success" sx={{ height: 20 }} />
                )}
              </Box>

              {calibrations.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Box sx={{ opacity: 0.15, mb: 1.5 }}><Award size={40} /></Box>
                  <Typography variant="body2" color="text.secondary">Sin calibraciones registradas</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell>N° Certificado</TableCell>
                        <TableCell>Resultado</TableCell>
                        <TableCell>Técnico</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calibrations.map((h, i) => (
                        <TableRow key={i} sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell sx={{ fontSize: "0.85rem" }}>{formatDate(h.calibrationDate)}</TableCell>
                          <TableCell sx={{ fontSize: "0.85rem" }}>{formatDate(h.calibrationExpirationDate)}</TableCell>
                          <TableCell>
                            {h.certificateNumber
                              ? <Chip label={h.certificateNumber} size="small" sx={{ borderRadius: 1, height: 22, bgcolor: "action.selected", fontFamily: "monospace", fontSize: "0.75rem" }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>
                            }
                          </TableCell>
                          <TableCell>
                            {h.technicalResult ? (
                              <Chip
                                label={h.technicalResult}
                                size="small"
                                color={h.technicalResult === "APPROVED" ? "success" : h.technicalResult === "REJECTED" ? "error" : "default"}
                                variant="outlined"
                                icon={h.technicalResult === "APPROVED" ? <CheckCircle size={12} /> : undefined}
                              />
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                            {h.technicianName || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* Service History */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                <ClipboardList size={16} color="#64748b" />
                <Typography fontWeight={700} variant="subtitle1">
                  Historial de Servicio
                </Typography>
              </Box>

              {serviceHistory.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Box sx={{ opacity: 0.15, mb: 1.5 }}><ClipboardList size={40} /></Box>
                  <Typography variant="body2" color="text.secondary">Sin historial de servicio</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                        <TableCell>Ingreso</TableCell>
                        <TableCell>Salida</TableCell>
                        <TableCell>Orden</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceHistory.map((h, i) => (
                        <TableRow
                          key={i}
                          hover
                          sx={{ cursor: h.serviceOrder ? "pointer" : "default", "&:last-child td": { border: 0 } }}
                          onClick={() => h.serviceOrder && navigate(`/portal/orders/${h.serviceOrder}`)}
                        >
                          <TableCell sx={{ fontSize: "0.85rem" }}>{formatDate(h.entryDate)}</TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{formatDate(h.exitDate)}</TableCell>
                          <TableCell>
                            {h.serviceOrder ? (
                              <Chip
                                label="Ver orden"
                                size="small"
                                color="primary"
                                variant="outlined"
                                clickable
                                sx={{ height: 22, fontSize: "0.75rem" }}
                              />
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Return Without Calibration Dialog ───────────────────────────────── */}
      <Dialog open={returnOpen} onClose={() => setReturnOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Solicitar devolución</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Al solicitar la devolución, el laboratorio procederá a devolver el equipo{" "}
            <strong>sin calibrar</strong>. Este proceso no tiene costo adicional.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            ¿Confirmás la devolución del equipo <strong>{equipment?.serialNumber}</strong>?
          </Typography>
          {returnMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(returnMutation.error as any)?.response?.data?.message ?? "Error al solicitar la devolución"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setReturnOpen(false)} color="inherit" disabled={returnMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => returnMutation.mutate(id!, { onSuccess: () => setReturnOpen(false) })}
            disabled={returnMutation.isPending}
            startIcon={returnMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <PackageX size={16} />}
          >
            {returnMutation.isPending ? "Procesando..." : "Confirmar devolución"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
