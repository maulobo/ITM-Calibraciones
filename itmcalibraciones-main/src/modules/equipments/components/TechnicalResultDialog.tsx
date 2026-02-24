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
} from "@mui/material";
import { X, CheckCircle, Wrench, XCircle, PackageX, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRegisterTechnicalResult } from "../hooks/useEquipments";
import type { NonCalibrationResult } from "../api";
import type { Equipment } from "../types";

// ─── Config por tipo de resultado ───────────────────────────────────────────
interface ResultConfig {
  label: string;
  description: string;
  autoReadyNote?: string;  // si aplica → auto READY_TO_DELIVER
  color: "success" | "warning" | "error" | "info";
  icon: React.ReactNode;
  confirmLabel: string;
}

const RESULT_CONFIG: Record<NonCalibrationResult, ResultConfig> = {
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

  const { register, handleSubmit, reset } = useForm<{ observations: string }>({
    defaultValues: { observations: "" },
  });

  const onSubmit = ({ observations }: { observations: string }) => {
    if (!equipment) return;
    mutation.mutate(
      { id: equipment._id, dto: { technicalResult: result, observations: observations || undefined } },
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

            {/* Observaciones */}
            <TextField
              {...register("observations")}
              label="Observaciones"
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
