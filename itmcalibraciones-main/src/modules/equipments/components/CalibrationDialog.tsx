import { useState } from "react";
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
} from "@mui/material";
import { X, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { StandardEquipmentSelector } from "./StandardEquipmentSelector";
import { useUpdateEquipment } from "../hooks/useEquipments";
import type { Equipment } from "../types";

interface CalibrationDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const CalibrationDialog = ({
  open,
  onClose,
  equipment,
}: CalibrationDialogProps) => {
  const updateMutation = useUpdateEquipment();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    calibrationDate: string;
    usedStandards: string[];
  }>();

  const onSubmit = (data: {
    calibrationDate: string;
    usedStandards: string[];
  }) => {
    if (!equipment) return;

    updateMutation.mutate(
      {
        id: equipment._id,
        technicalState: "CALIBRATED",
        calibrationDate: data.calibrationDate,
        usedStandards: data.usedStandards,
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Registrar Calibración
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Información del Equipo */}
            <Alert severity="info">
              <Typography variant="body2" fontWeight={500}>
                Equipo: {equipment?.model?.brand?.name} {equipment?.model?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                S/N: {equipment?.serialNumber}
              </Typography>
            </Alert>

            {/* Fecha de Calibración */}
            <TextField
              {...register("calibrationDate", {
                required: "Fecha de calibración requerida",
              })}
              label="Fecha de Calibración"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.calibrationDate}
              helperText={errors.calibrationDate?.message}
            />

            {/* Selector de Patrones */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                Patrones Utilizados
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Selecciona todos los patrones (instrumentos maestros) que usaste
                para calibrar este equipo. Esta información aparecerá en el
                certificado.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Controller
                  name="usedStandards"
                  control={control}
                  defaultValue={[]}
                  rules={{
                    required: "Debes seleccionar al menos un patrón",
                    validate: (value) =>
                      value.length > 0 ||
                      "Debes seleccionar al menos un patrón",
                  }}
                  render={({ field }) => (
                    <StandardEquipmentSelector
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.usedStandards}
                      helperText={errors.usedStandards?.message}
                    />
                  )}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save size={18} />}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Calibración"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
