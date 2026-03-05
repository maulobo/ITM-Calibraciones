import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  ArrowLeft,
  FlaskConical,
  PackageCheck,
  Truck,
  Plane,
  Home,
  Calendar,
  FileText,
  History,
  User,
  Beaker,
  CheckCircle,
  Wrench,
  XCircle,
  PackageX,
  PauseCircle,
  Mail,
  Building2,
  Tag,
  Ruler,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as equipmentsApi from "../api";
import { useUpdateEquipment, useUnblockEquipment } from "../hooks/useEquipments";
import { useServiceOrder } from "../../service-orders/hooks/useServiceOrders";
import { useBudgetsByEquipment } from "../../budgets/hooks/useBudgets";
import { BlockNotificationPreviewDialog } from "../components/BlockNotificationPreviewDialog";
import { LogisticStateBadge } from "../components/LogisticStateBadge";
import { UsedStandardsDisplay } from "../components/UsedStandardsDisplay";
import { CalibrationDialog } from "../components/CalibrationDialog";
import { MoveToOutputTrayDialog } from "../components/MoveToOutputTrayDialog";
import { DeliveryDialog } from "../components/DeliveryDialog";
import { SendToExternalLabDialog } from "../components/SendToExternalLabDialog";
import { ReturnFromExternalLabDialog } from "../components/ReturnFromExternalLabDialog";
import { TechnicalResultDialog } from "../components/TechnicalResultDialog";
import { EquipmentLogisticState } from "../types";
import type { NonCalibrationResult } from "../api";

// ─── Label / color maps ──────────────────────────────────────────────────────
const TECH_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROCESS: "En Proceso",
  BLOCKED: "Frenado",
  CALIBRATED: "Calibrado",
  VERIFIED: "Verificado",
  MAINTENANCE: "Mantenimiento",
  OUT_OF_SERVICE: "Fuera de Servicio",
  RETURN_WITHOUT_CALIBRATION: "Dev. sin Calibración",
};

const TECH_COLORS: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  CALIBRATED: "success",
  VERIFIED: "success",
  MAINTENANCE: "success",
  IN_PROCESS: "warning",
  BLOCKED: "error",
  OUT_OF_SERVICE: "error",
  RETURN_WITHOUT_CALIBRATION: "error",
  PENDING: "default",
};

// ─── Small helper components ─────────────────────────────────────────────────
const InfoCard = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: "background.default",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1.5,
    }}
  >
    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      fontFamily={mono ? "monospace" : undefined}
      sx={{ wordBreak: "break-all" }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

const StripItem = ({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  mono?: boolean;
}) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>
    <Typography variant="caption" color="text.secondary">{label}:</Typography>
    <Typography variant="caption" fontWeight={600} fontFamily={mono ? "monospace" : undefined}>
      {value || "—"}
    </Typography>
  </Stack>
);

// ─── Tab panel ───────────────────────────────────────────────────────────────
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);

  const updateMutation  = useUpdateEquipment();
  const unblockMutation = useUnblockEquipment();
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [outputTrayDialog, setOutputTrayDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [externalLabDialog, setExternalLabDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [technicalResultDialog, setTechnicalResultDialog] = useState(false);
  const [technicalResultType, setTechnicalResultType] = useState<NonCalibrationResult>("VERIFIED");

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => equipmentsApi.getEquipmentById(id!),
    enabled: !!id,
  });

  // Hooks must be called unconditionally — before any early return
  const isBlocked      = equipment?.technicalState === "BLOCKED";
  const serviceOrderId = isBlocked ? (equipment as any).serviceOrder as string | undefined : undefined;
  const { data: blockedServiceOrder, isLoading: isLoadingOrder } = useServiceOrder(serviceOrderId ?? "");
  const { data: linkedBudgets = [] } = useBudgetsByEquipment(equipment?._id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "—";
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={140} height={32} sx={{ mb: 2.5 }} />
        {/* Hero skeleton */}
        <Paper elevation={0} sx={{ mb: 3, overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Box sx={{ p: 3, bgcolor: "#0f172a" }}>
            <Skeleton variant="text" width={100} sx={{ bgcolor: "rgba(255,255,255,0.08)", mb: 1 }} />
            <Skeleton variant="text" width={280} height={48} sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1.5 }} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={130} height={26} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
              <Skeleton variant="rounded" width={80} height={26} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
            </Stack>
          </Box>
          <Box sx={{ px: 3, py: 1.5, display: "flex", gap: 3 }}>
            <Skeleton width={100} />
            <Skeleton width={120} />
          </Box>
        </Paper>
        {/* Body skeleton */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 3 }}>
              <Stack spacing={1.5}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} height={58} variant="rounded" sx={{ borderRadius: 1.5 }} />
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
              <Skeleton width={80} sx={{ mb: 1.5 }} />
              <Stack spacing={1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={36} variant="rounded" />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box>
        <Alert severity="error">Equipo no encontrado</Alert>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate("/equipments")} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  // ─── Action guards ──────────────────────────────────────────────────────────
  const canMoveToLab    = equipment.logisticState === EquipmentLogisticState.RECEIVED;
  const canCalibrate    = equipment.logisticState === EquipmentLogisticState.IN_LABORATORY;
  const canMoveToReady  = ["CALIBRATED", "VERIFIED", "MAINTENANCE"].includes(equipment.technicalState ?? "")
                          && equipment.logisticState !== EquipmentLogisticState.READY_TO_DELIVER
                          && equipment.logisticState !== EquipmentLogisticState.DELIVERED;
  const canDeliver      = equipment.logisticState === EquipmentLogisticState.READY_TO_DELIVER;
  const canReturnFromExternal = equipment.logisticState === EquipmentLogisticState.EXTERNAL;
  const canSendToExternal     = equipment.logisticState === EquipmentLogisticState.IN_LABORATORY;
  const hasAnyAction = canMoveToLab || canCalibrate || isBlocked || canMoveToReady || canDeliver || canReturnFromExternal;

  const openTechnicalResult = (result: NonCalibrationResult) => {
    setTechnicalResultType(result);
    setTechnicalResultDialog(true);
  };

  const handleMoveToLab = () => {
    updateMutation.mutate(
      { id: equipment._id, logisticState: EquipmentLogisticState.IN_LABORATORY },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment", id] }) },
    );
  };

  const techLabel = TECH_LABELS[equipment.technicalState ?? ""] ?? equipment.technicalState ?? "Pendiente";
  const techColor = TECH_COLORS[equipment.technicalState ?? ""] ?? "default";

  return (
    <Box>
      {/* ── Back ──────────────────────────────────────────────────────────── */}
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/equipments")}
        size="small"
        sx={{ mb: 2.5, color: "text.secondary" }}
      >
        Volver a Equipos
      </Button>

      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ mb: 3, overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        {/* Dark gradient header */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            color: "white",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} gap={2}>
            <Box flex={1}>
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: 2, fontSize: "0.68rem", display: "block", mb: 0.5 }}
              >
                {equipment.model?.equipmentType?.type ?? "Equipo"}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "white", lineHeight: 1.2, mb: 1.5 }}>
                {equipment.model?.brand?.name} {equipment.model?.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                <Chip
                  label={`S/N: ${equipment.serialNumber}`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontFamily: "monospace",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontWeight: 600,
                  }}
                />
                {equipment.otCode && (
                  <Tooltip title="Código de Orden de Trabajo">
                    <Chip
                      label={equipment.otCode}
                      size="small"
                      sx={{
                        bgcolor: "rgba(99,102,241,0.35)",
                        color: "white",
                        fontFamily: "monospace",
                        border: "1px solid rgba(99,102,241,0.55)",
                        fontWeight: 600,
                      }}
                    />
                  </Tooltip>
                )}
                {equipment.tag && (
                  <Chip
                    label={equipment.tag}
                    size="small"
                    icon={<Tag size={12} color="rgba(255,255,255,0.6)" />}
                    sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}
                    variant="outlined"
                  />
                )}
                {equipment.range && (
                  <Chip
                    label={equipment.range}
                    size="small"
                    icon={<Ruler size={12} color="rgba(255,255,255,0.6)" />}
                    sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* State badges */}
            <Stack spacing={1} alignItems={{ xs: "flex-start", sm: "flex-end" }} sx={{ flexShrink: 0 }}>
              <LogisticStateBadge state={equipment.logisticState || ""} size="medium" />
              <Chip
                label={techLabel}
                color={techColor}
                size="small"
                sx={{ fontWeight: 700, px: 0.5 }}
              />
              {equipment.technicalState === "BLOCKED" && (equipment as any).blockReason && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,200,200,0.9)", maxWidth: 200, textAlign: "right", fontStyle: "italic" }}
                >
                  {(equipment as any).blockReason}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Info strip */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: "background.neutral",
            display: "flex",
            gap: { xs: 2, sm: 3 },
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
          }}
        >
          <StripItem icon={<Building2 size={13} />} label="Sucursal" value={equipment.office?.name} />
          {equipment.calibrationDate && (
            <StripItem icon={<Calendar size={13} />} label="Últ. calibración" value={formatDateShort(equipment.calibrationDate)} />
          )}
          {equipment.remittanceNumber && (
            <StripItem icon={<FileText size={13} />} label="Remito" value={equipment.remittanceNumber} mono />
          )}
          {equipment.certificateNumber && (
            <StripItem icon={<FileText size={13} />} label="Certificado" value={equipment.certificateNumber} mono />
          )}
        </Box>
      </Paper>

      {/* ── Body: 2 columns ──────────────────────────────────────────────── */}
      <Grid container spacing={3} alignItems="flex-start">

        {/* ── Left: tabbed content ─────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Tab label="Información" icon={<FileText size={14} />} iconPosition="start" sx={{ minHeight: 48, fontSize: "0.82rem" }} />
              <Tab label="Patrones" icon={<Beaker size={14} />} iconPosition="start" sx={{ minHeight: 48, fontSize: "0.82rem" }} />
              <Tab label="Historial" icon={<History size={14} />} iconPosition="start" sx={{ minHeight: 48, fontSize: "0.82rem" }} />
            </Tabs>

            {/* ── Tab 0: Información ─────────────────────────────────────── */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <InfoCard label="Marca" value={equipment.model?.brand?.name} />
                      <InfoCard label="Modelo" value={equipment.model?.name} />
                      <InfoCard label="Tipo de Equipo" value={equipment.model?.equipmentType?.type} />
                      <InfoCard label="Número de Serie" value={equipment.serialNumber} mono />
                      {equipment.tag && <InfoCard label="Tag / Identificación" value={equipment.tag} />}
                      {equipment.range && <InfoCard label="Rango" value={equipment.range} />}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <InfoCard label="Sucursal" value={equipment.office?.name} />
                      <InfoCard label="Fecha de Ingreso" value={formatDate(equipment.createdAt)} />
                      {equipment.calibrationDate && (
                        <InfoCard label="Última Calibración" value={formatDateShort(equipment.calibrationDate)} />
                      )}
                      {equipment.deliveryDate && (
                        <InfoCard label="Fecha de Entrega" value={formatDate(equipment.deliveryDate)} />
                      )}
                      {equipment.remittanceNumber && (
                        <InfoCard label="N° Remito" value={equipment.remittanceNumber} mono />
                      )}
                      {equipment.certificateNumber && (
                        <InfoCard label="N° Certificado" value={equipment.certificateNumber} mono />
                      )}
                    </Stack>
                  </Grid>

                  {equipment.observations && (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          bgcolor: "warning.lighter",
                          border: "1px solid",
                          borderColor: "warning.light",
                          borderRadius: 1.5,
                          p: 2,
                        }}
                      >
                        <Typography variant="caption" color="warning.dark" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                          Observaciones
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {equipment.observations}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* External provider alert */}
                {equipment.logisticState === EquipmentLogisticState.EXTERNAL && equipment.externalProvider && (
                  <Alert severity="info" icon={<Plane size={18} />} sx={{ mt: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      En Laboratorio Externo: {equipment.externalProvider.providerName}
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        <strong>Enviado:</strong> {formatDate(equipment.externalProvider.sentDate)}
                      </Typography>
                      {equipment.externalProvider.expectedReturnDate && (
                        <Typography variant="body2">
                          <strong>Retorno esperado:</strong>{" "}
                          {formatDateShort(equipment.externalProvider.expectedReturnDate)}
                        </Typography>
                      )}
                      {equipment.externalProvider.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Notas:</strong> {equipment.externalProvider.notes}
                        </Typography>
                      )}
                    </Stack>
                  </Alert>
                )}
              </Box>
            </TabPanel>

            {/* ── Tab 1: Patrones ────────────────────────────────────────── */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3 }}>
                {equipment.usedStandards && equipment.usedStandards.length > 0 ? (
                  <UsedStandardsDisplay standards={equipment.usedStandards} />
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Beaker size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <Typography color="text.secondary">
                      Sin patrones registrados aún.
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* ── Tab 2: Historial ───────────────────────────────────────── */}
            <TabPanel value={tabValue} index={2}>
              {equipment.serviceHistory && equipment.serviceHistory.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "background.neutral" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", whiteSpace: "nowrap" }}>OT</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", whiteSpace: "nowrap" }}>Ingreso</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", whiteSpace: "nowrap" }}>Calibración</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", whiteSpace: "nowrap" }}>Vencimiento</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem" }}>Resultado</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem" }}>Técnico</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", whiteSpace: "nowrap" }}>Certificado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...equipment.serviceHistory].reverse().map((entry, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant="caption" fontFamily="monospace" color="primary.main" fontWeight={700}>
                              {typeof entry.serviceOrder === "string"
                                ? entry.serviceOrder.slice(-6).toUpperCase()
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{formatDateShort(entry.entryDate)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {entry.calibrationDate ? formatDateShort(entry.calibrationDate) : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {entry.calibrationExpirationDate ? formatDateShort(entry.calibrationExpirationDate) : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {entry.technicalResult ? (
                              <Chip
                                label={TECH_LABELS[entry.technicalResult] ?? entry.technicalResult}
                                size="small"
                                color={
                                  ["CALIBRATED", "VERIFIED", "MAINTENANCE"].includes(entry.technicalResult)
                                    ? "success"
                                    : ["OUT_OF_SERVICE", "RETURN_WITHOUT_CALIBRATION"].includes(entry.technicalResult)
                                    ? "error"
                                    : "default"
                                }
                              />
                            ) : (
                              <Chip label="En proceso" size="small" color="warning" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.technicianName ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <User size={12} color="#64748b" />
                                <Typography variant="caption">{entry.technicianName}</Typography>
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" fontFamily="monospace">
                              {entry.certificateNumber ?? "—"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
                  <History size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                  <Typography color="text.secondary">Sin historial de servicios aún.</Typography>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* ── Right: sidebar ────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Actions card */}
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: "background.neutral", borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight={700}>Acciones</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {/* RECEIVED → Mover a Lab */}
                {canMoveToLab && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    startIcon={<Beaker size={16} />}
                    onClick={handleMoveToLab}
                    disabled={updateMutation.isPending}
                    size="large"
                  >
                    Mover a Laboratorio
                  </Button>
                )}

                {/* BLOCKED → info + acciones */}
                {isBlocked && (() => {
                  const blockTypeLabel = {
                    BROKEN:                    "Equipo roto / no funciona",
                    NEEDS_PART:               "Requiere repuesto",
                    NEEDS_EXTERNAL_MAINTENANCE:"Requiere mantenimiento externo",
                    OTHER:                    "Otro motivo",
                  }[(equipment as any).blockType] ?? "Sin especificar";

                  return (
                    <Stack spacing={1}>
                      <Alert severity="warning" sx={{ py: 0.5, borderRadius: 1.5, fontSize: "0.82rem" }}>
                        <strong>{blockTypeLabel}</strong>
                        {(equipment as any).blockReason && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
                            {(equipment as any).blockReason}
                          </Typography>
                        )}
                      </Alert>
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<PauseCircle size={16} />}
                        onClick={() => unblockMutation.mutate(equipment._id)}
                        disabled={unblockMutation.isPending}
                        size="large"
                      >
                        {unblockMutation.isPending ? "Retomando..." : "Retomar trabajo"}
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        startIcon={<Mail size={15} />}
                        onClick={() => setPreviewOpen(true)}
                        size="small"
                      >
                        Notificar cliente por email
                      </Button>
                      {linkedBudgets.length > 0 ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
                            Presupuesto{linkedBudgets.length > 1 ? "s" : ""} vinculado{linkedBudgets.length > 1 ? "s" : ""}
                          </Typography>
                          <Stack spacing={0.5}>
                            {linkedBudgets.map((b: any) => {
                              const statusColor = b.status === "APPROVED" ? "success" : b.status === "REJECTED" ? "error" : "warning";
                              const statusLabel = b.status === "APPROVED" ? "Aprobado" : b.status === "REJECTED" ? "Rechazado" : "Pendiente";
                              const code = b.code ?? `${String(b.year).slice(-2)}-${String(b.number).padStart(5,"0")}`;
                              return (
                                <Box key={b._id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
                                  <FileText size={13} color="#64748b" />
                                  <Typography variant="caption" fontWeight={700} fontFamily="monospace" sx={{ flexGrow: 1 }}>{code}</Typography>
                                  <Chip label={statusLabel} color={statusColor} size="small" sx={{ height: 20, fontSize: "0.72rem" }} />
                                  <Button size="small" sx={{ minWidth: "auto", p: 0.25, fontSize: "0.72rem" }} onClick={() => navigate(`/budgets/${b._id}`)}>
                                    Ver
                                  </Button>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          startIcon={<FileText size={15} />}
                          size="small"
                          onClick={() =>
                            navigate("/budgets/new", {
                              state: {
                                fromEquipment: {
                                  clientId:    (equipment.office as any)?.client?.toString(),
                                  officeId:    equipment.office?._id,
                                  equipmentId: equipment._id,
                                  otCode:      equipment.otCode,
                                  description: blockTypeLabel,
                                },
                              },
                            })
                          }
                        >
                          Crear presupuesto
                        </Button>
                      )}
                    </Stack>
                  );
                })()}

                {/* IN_LABORATORY → Lab work */}
                {canCalibrate && (
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<FlaskConical size={16} />}
                      onClick={() => setCalibrationDialog(true)}
                      size="large"
                    >
                      Registrar Calibración
                    </Button>

                    <Divider sx={{ my: 0.5 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
                        otros resultados
                      </Typography>
                    </Divider>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<PauseCircle size={15} />}
                      onClick={() => openTechnicalResult("BLOCKED")}
                      size="small"
                    >
                      Frenado (no puede continuar)
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle size={15} />}
                      onClick={() => openTechnicalResult("VERIFIED")}
                      size="small"
                    >
                      Verificado (sin certificado)
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      startIcon={<Wrench size={15} />}
                      onClick={() => openTechnicalResult("MAINTENANCE")}
                      size="small"
                    >
                      Mantenimiento Realizado
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<XCircle size={15} />}
                      onClick={() => openTechnicalResult("OUT_OF_SERVICE")}
                      size="small"
                    >
                      Fuera de Servicio
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<PackageX size={15} />}
                      onClick={() => openTechnicalResult("RETURN_WITHOUT_CALIBRATION")}
                      size="small"
                    >
                      Devolución sin Calibración
                    </Button>

                    {canSendToExternal && (
                      <>
                        <Divider sx={{ my: 0.5 }} />
                        <Button
                          fullWidth
                          variant="text"
                          color="inherit"
                          startIcon={<Plane size={15} />}
                          onClick={() => setExternalLabDialog(true)}
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          Enviar a Lab. Externo
                        </Button>
                      </>
                    )}
                  </Stack>
                )}

                {/* Has terminal tech state → Mark ready */}
                {canMoveToReady && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<PackageCheck size={16} />}
                    onClick={() => setOutputTrayDialog(true)}
                    size="large"
                  >
                    Marcar Listo para Retiro
                  </Button>
                )}

                {/* READY_TO_DELIVER → Deliver */}
                {canDeliver && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<Truck size={16} />}
                    onClick={() => setDeliveryDialog(true)}
                    size="large"
                  >
                    Registrar Entrega
                  </Button>
                )}

                {/* EXTERNAL → Return */}
                {canReturnFromExternal && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    startIcon={<Home size={16} />}
                    onClick={() => setReturnDialog(true)}
                    size="large"
                  >
                    Registrar Retorno del Externo
                  </Button>
                )}

                {!hasAnyAction && (
                  <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ py: 1 }}>
                    Sin acciones disponibles
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Quick dates card */}
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: "background.neutral", borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight={700}>Fechas Clave</Typography>
              </Box>
              <Stack spacing={0} divider={<Divider />}>
                <QuickDate icon={<Calendar size={14} />} label="Ingreso" value={formatDateShort(equipment.createdAt)} />
                <QuickDate icon={<FlaskConical size={14} />} label="Últ. calibración" value={formatDateShort(equipment.calibrationDate)} />
                <QuickDate icon={<Truck size={14} />} label="Entrega" value={formatDateShort(equipment.deliveryDate)} />
              </Stack>
            </Paper>

          </Stack>
        </Grid>
      </Grid>

      {/* ── Historial de acciones ──────────────────────────────────────── */}
      {(equipment.actionHistory?.length ?? 0) > 0 && (
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", mt: 3 }}>
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "background.neutral", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <History size={16} />
            <Typography variant="subtitle2" fontWeight={700}>Historial de acciones</Typography>
          </Box>
          <Box sx={{ px: 3, py: 2 }}>
            <Stack spacing={0}>
              {[...(equipment.actionHistory ?? [])].reverse().map((entry, i, arr) => (
                <Box key={i} sx={{ display: "flex", gap: 2, pb: i < arr.length - 1 ? 2 : 0 }}>
                  {/* timeline dot + line */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
                    {i < arr.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", mt: 0.5 }} />}
                  </Box>
                  <Box sx={{ pb: i < arr.length - 1 ? 0.5 : 0 }}>
                    <Typography variant="body2" fontWeight={600}>{entry.label ?? entry.action}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.at ? format(new Date(entry.at), "dd/MM/yyyy HH:mm", { locale: es }) : "—"}
                      {entry.performedBy && <> &nbsp;·&nbsp; {entry.performedBy}</>}
                    </Typography>
                    {entry.notes && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: "italic" }}>
                        {entry.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <CalibrationDialog open={calibrationDialog} onClose={() => setCalibrationDialog(false)} equipment={equipment} />
      <MoveToOutputTrayDialog open={outputTrayDialog} onClose={() => setOutputTrayDialog(false)} equipment={equipment} />
      <DeliveryDialog open={deliveryDialog} onClose={() => setDeliveryDialog(false)} equipment={equipment} />
      <SendToExternalLabDialog open={externalLabDialog} onClose={() => setExternalLabDialog(false)} equipment={equipment} />
      <ReturnFromExternalLabDialog open={returnDialog} onClose={() => setReturnDialog(false)} equipment={equipment} />
      <TechnicalResultDialog
        open={technicalResultDialog}
        onClose={() => setTechnicalResultDialog(false)}
        equipment={equipment}
        result={technicalResultType}
      />
      <BlockNotificationPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        equipment={equipment}
        serviceOrder={blockedServiceOrder}
        isLoadingOrder={isLoadingOrder}
      />
    </Box>
  );
};

// ─── Sidebar quick-date row ───────────────────────────────────────────────────
const QuickDate = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Box sx={{ px: 2.5, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
    <Typography variant="caption" fontWeight={600} color={value === "—" ? "text.disabled" : "text.primary"}>
      {value}
    </Typography>
  </Box>
);
