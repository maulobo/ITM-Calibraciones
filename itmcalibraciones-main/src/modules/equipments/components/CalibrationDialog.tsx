import { useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { X, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { StandardEquipmentSelector } from "./StandardEquipmentSelector";
import { useRegisterCalibration } from "../hooks/useEquipments";
import type { Equipment } from "../types";

interface FormData {
  calibrationDate: string;
  validityMonths: number;
  calibrationExpirationDate: string;
  usedStandards: string[];
}

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
  const calibrationMutation = useRegisterCalibration();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      validityMonths: 12,
    },
  });

  const calibrationDate = watch("calibrationDate");
  const validityMonths = watch("validityMonths");

  // Auto-calcular fecha de vencimiento cuando cambia la fecha base o los meses
  useEffect(() => {
    if (calibrationDate && Number(validityMonths) > 0) {
      const base = new Date(calibrationDate + "T00:00:00");
      base.setMonth(base.getMonth() + Number(validityMonths));
      setValue("calibrationExpirationDate", base.toISOString().split("T")[0]);
    }
  }, [calibrationDate, validityMonths, setValue]);

  const onSubmit = (data: FormData) => {
    if (!equipment) return;

    calibrationMutation.mutate(
      {
        id: equipment._id,
        dto: {
          calibrationDate: data.calibrationDate,
          calibrationExpirationDate: data.calibrationExpirationDate,
          usedStandards: data.usedStandards,
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

            {/* Vigencia de calibración */}
            <Controller
              name="validityMonths"
              control={control}
              rules={{ required: "Seleccione la vigencia" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.validityMonths}>
                  <InputLabel>Vigencia de Calibración</InputLabel>
                  <Select {...field} label="Vigencia de Calibración">
                    <MenuItem value={6}>6 meses</MenuItem>
                    <MenuItem value={12}>12 meses</MenuItem>
                    <MenuItem value={18}>18 meses</MenuItem>
                    <MenuItem value={24}>24 meses</MenuItem>
                    <MenuItem value={36}>36 meses</MenuItem>
                    <MenuItem value={0}>Personalizado</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Fecha de Vencimiento (calculada o manual) */}
            <TextField
              {...register("calibrationExpirationDate", {
                required: "Fecha de vencimiento requerida",
              })}
              label="Fecha de Vencimiento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: Number(validityMonths) > 0 }}
              helperText={
                Number(validityMonths) > 0
                  ? "Calculada automáticamente según la vigencia seleccionada"
                  : "Ingrese la fecha de vencimiento manualmente"
              }
              error={!!errors.calibrationExpirationDate}
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
            disabled={calibrationMutation.isPending}
          >
            {calibrationMutation.isPending ? "Guardando..." : "Guardar Calibración"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
