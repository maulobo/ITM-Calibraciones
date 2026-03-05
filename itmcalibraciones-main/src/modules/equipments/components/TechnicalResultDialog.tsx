import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stack,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { X, CheckCircle, Wrench, XCircle, PackageX, Info, PauseCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useRegisterTechnicalResult } from "../hooks/useEquipments";
import type { NonCalibrationResult } from "../api";
import type { Equipment } from "../types";

// ─── Tipos de freno ──────────────────────────────────────────────────────────
export const BLOCK_TYPES = [
  { value: "BROKEN",                    label: "Equipo roto / no funciona" },
  { value: "NEEDS_PART",               label: "Requiere repuesto" },
  { value: "NEEDS_EXTERNAL_MAINTENANCE",label: "Requiere mantenimiento externo" },
  { value: "OTHER",                     label: "Otro motivo" },
] as const;

export type BlockType = typeof BLOCK_TYPES[number]["value"];

// ─── Config por tipo de resultado ───────────────────────────────────────────
interface ResultConfig {
  label: string;
  description: string;
  autoReadyNote?: string;  // si aplica → auto READY_TO_DELIVER
  requiresBlockReason?: boolean;
  color: "success" | "warning" | "error" | "info";
  icon: React.ReactNode;
  confirmLabel: string;
}

const RESULT_CONFIG: Record<NonCalibrationResult, ResultConfig> = {
  BLOCKED: {
    label: "Frenado",
    description:
      "No se puede continuar con la calibración. El trabajo queda pausado hasta resolver el problema.",
    color: "warning",
    icon: <PauseCircle size={20} />,
    confirmLabel: "Confirmar Freno",
    requiresBlockReason: true,
  },
  VERIFIED: {
    label: "Verificado",
    description:
      "El equipo fue revisado y funciona correctamente. No se emite certificado de calibración.",
    color: "success",
    icon: <CheckCircle size={20} />,
    confirmLabel: "Confirmar Verificación",
  },
  MAINTENANCE: {
    label: "Mantenimiento Realizado",
    description:
      "Se realizó mantenimiento o reparación. El equipo quedó operativo.",
    color: "info",
    icon: <Wrench size={20} />,
    confirmLabel: "Confirmar Mantenimiento",
  },
  OUT_OF_SERVICE: {
    label: "Fuera de Servicio",
    description:
      "El equipo no puede ser reparado ni calibrado. Se dará de baja.",
    autoReadyNote: "El equipo se moverá automáticamente a «Listo para Retiro».",
    color: "error",
    icon: <XCircle size={20} />,
    confirmLabel: "Confirmar Fuera de Servicio",
  },
  RETURN_WITHOUT_CALIBRATION: {
    label: "Devolución sin Calibración",
    description: "El cliente decide retirar el equipo sin calibrar.",
    autoReadyNote: "El equipo se moverá automáticamente a «Listo para Retiro».",
    color: "warning",
    icon: <PackageX size={20} />,
    confirmLabel: "Confirmar Devolución",
  },
};

// ─── Color de header por tipo ────────────────────────────────────────────────
const HEADER_BG: Record<NonCalibrationResult, string> = {
  BLOCKED:                    "warning.dark",
  VERIFIED:                   "success.main",
  MAINTENANCE:                "info.main",
  OUT_OF_SERVICE:             "error.main",
  RETURN_WITHOUT_CALIBRATION: "warning.main",
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface TechnicalResultDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  result: NonCalibrationResult;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const TechnicalResultDialog = ({
  open,
  onClose,
  equipment,
  result,
}: TechnicalResultDialogProps) => {
  const mutation = useRegisterTechnicalResult();
  const config = RESULT_CONFIG[result];

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<{
    observations: string;
    blockType: BlockType | "";
    blockReason: string;
  }>({
    defaultValues: { observations: "", blockType: "", blockReason: "" },
  });

  const watchedBlockType = watch("blockType");

  const onSubmit = ({ observations, blockType, blockReason }: { observations: string; blockType: BlockType | ""; blockReason: string }) => {
    if (!equipment) return;
    mutation.mutate(
      {
        id: equipment._id,
        dto: {
          technicalResult: result,
          observations: observations || undefined,
          blockType: result === "BLOCKED" ? (blockType as BlockType) : undefined,
          blockReason: result === "BLOCKED" && blockType === "NEEDS_PART" ? blockReason : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: HEADER_BG[result],
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {config.icon}
          <Typography variant="h6" fontWeight="bold">
            {config.label}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            {/* Equipo afectado */}
            <Alert severity={config.color} icon={false} sx={{ borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="body2" fontWeight={600}>
                  {equipment?.model?.brand?.name} {equipment?.model?.name}
                </Typography>
                <Chip
                  label={`S/N: ${equipment?.serialNumber}`}
                  size="small"
                  sx={{ fontFamily: "monospace", height: 20, fontSize: 11 }}
                />
                {equipment?.otCode && (
                  <Chip
                    label={equipment.otCode}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace", height: 20, fontSize: 11 }}
                  />
                )}
              </Box>
            </Alert>

            {/* Descripción de la acción */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Info size={16} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                {config.description}
              </Typography>
            </Box>

            {/* Nota sobre auto READY_TO_DELIVER */}
            {config.autoReadyNote && (
              <Alert severity="warning" sx={{ py: 0.5, borderRadius: 2, fontSize: "0.82rem" }}>
                {config.autoReadyNote}
              </Alert>
            )}

            {/* Formulario estructurado de freno — solo para BLOCKED */}
            {config.requiresBlockReason && (
              <Stack spacing={2}>
                {/* Tipo de freno */}
                <Controller
                  name="blockType"
                  control={control}
                  rules={{ required: "Seleccioná el motivo del freno" }}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.blockType}>
                      <InputLabel>Motivo del freno *</InputLabel>
                      <Select {...field} label="Motivo del freno *">
                        {BLOCK_TYPES.map((bt) => (
                          <MenuItem key={bt.value} value={bt.value}>
                            {bt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {errors.blockType?.message ?? "¿Por qué no puede continuar?"}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                {/* Detalle del repuesto — solo si NEEDS_PART */}
                {watchedBlockType === "NEEDS_PART" && (
                  <TextField
                    {...register("blockReason", { required: "Indicá qué repuesto se necesita" })}
                    label="¿Qué repuesto necesita? *"
                    placeholder="Ej: Sensor de temperatura NTC 10kΩ, fusible 250V 2A..."
                    fullWidth
                    size="small"
                    error={!!errors.blockReason}
                    helperText={errors.blockReason?.message}
                  />
                )}
              </Stack>
            )}

            {/* Observaciones */}
            <TextField
              {...register("observations")}
              label={config.requiresBlockReason ? "Observaciones adicionales" : "Observaciones"}
              placeholder="Describí qué se hizo, qué se encontró, novedades..."
              multiline
              minRows={3}
              fullWidth
              size="small"
              helperText="Se guardará en el historial del equipo junto con tu usuario y la fecha."
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={config.color}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Guardando..." : config.confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
