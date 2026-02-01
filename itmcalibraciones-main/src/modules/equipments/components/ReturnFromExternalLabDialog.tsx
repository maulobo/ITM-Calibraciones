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
  Grid,
  Chip,
} from "@mui/material";
import { X, Home, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUpdateEquipment } from "../hooks/useEquipments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Equipment, ExternalProvider } from "../types";

interface ReturnFromExternalLabDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const ReturnFromExternalLabDialog = ({
  open,
  onClose,
  equipment,
}: ReturnFromExternalLabDialogProps) => {
  const updateMutation = useUpdateEquipment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    actualReturnDate: string;
    exitNote?: string;
  }>();

  const onSubmit = (data: { actualReturnDate: string; exitNote?: string }) => {
    if (!equipment || !equipment.externalProvider) return;

    const updatedProvider: ExternalProvider = {
      ...equipment.externalProvider,
      actualReturnDate: data.actualReturnDate,
      exitNote: data.exitNote || equipment.externalProvider.exitNote,
    };

    updateMutation.mutate(
      {
        id: equipment._id,
        location: "ITM",
        logisticState: "IN_LABORATORY",
        externalProvider: updatedProvider,
      },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      },
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "success.main",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Home size={22} />
          <Typography variant="h6" fontWeight="bold">
            Registrar Retorno de Laboratorio Externo
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2" fontWeight={500}>
                Equipo: {equipment?.model?.brand?.name} {equipment?.model?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                S/N: {equipment?.serialNumber}
              </Typography>
            </Alert>

            {/* Información del envío original */}
            {equipment?.externalProvider && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.neutral",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  gutterBottom
                  color="text.primary"
                >
                  Información del Envío
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Proveedor:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {equipment.externalProvider.providerName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fecha de Envío:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(equipment.externalProvider.sentDate)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Retorno Estimado:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(
                        equipment.externalProvider.projectedReturnDate,
                      )}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    {equipment.externalProvider.exitNote && (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          Nota de Salida:
                        </Typography>
                        <Typography variant="body2" fontStyle="italic">
                          {equipment.externalProvider.exitNote}
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Calendar size={18} />
                Registro de Retorno
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("actualReturnDate", {
                    required: "Fecha de retorno requerida",
                  })}
                  label="Fecha Real de Retorno"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.actualReturnDate}
                  helperText={errors.actualReturnDate?.message}
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("exitNote")}
                  label="Observaciones de Retorno (Opcional)"
                  placeholder="Ej: Volvió OK, sin novedades"
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Estado del equipo al regresar"
                />
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                ✅ El equipo volverá a <strong>ITM</strong> y estará disponible
                en laboratorio para control de calidad.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            startIcon={<Home size={18} />}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? "Registrando..."
              : "Registrar Reingreso"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
