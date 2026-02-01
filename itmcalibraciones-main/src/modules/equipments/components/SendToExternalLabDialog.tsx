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
} from "@mui/material";
import { X, Plane, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUpdateEquipment } from "../hooks/useEquipments";
import type { Equipment, ExternalProvider } from "../types";

interface SendToExternalLabDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const SendToExternalLabDialog = ({
  open,
  onClose,
  equipment,
}: SendToExternalLabDialogProps) => {
  const updateMutation = useUpdateEquipment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    providerName: string;
    sentDate: string;
    projectedReturnDate: string;
    exitNote?: string;
  }>();

  const onSubmit = (data: {
    providerName: string;
    sentDate: string;
    projectedReturnDate: string;
    exitNote?: string;
  }) => {
    if (!equipment) return;

    const externalProvider: ExternalProvider = {
      providerName: data.providerName,
      sentDate: data.sentDate,
      projectedReturnDate: data.projectedReturnDate,
      exitNote: data.exitNote,
    };

    updateMutation.mutate(
      {
        id: equipment._id,
        location: "EXTERNAL",
        externalProvider,
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
          bgcolor: "info.main",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Plane size={22} />
          <Typography variant="h6" fontWeight="bold">
            Enviar a Laboratorio Externo
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

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Building2 size={18} />
                Información del Proveedor Externo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                El equipo no se calibra en ITM y se deriva a otro proveedor
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("providerName", {
                    required: "Nombre del proveedor requerido",
                  })}
                  label="Nombre del Proveedor"
                  placeholder="Ej: Viditec, Siafa, INTI"
                  fullWidth
                  error={!!errors.providerName}
                  helperText={errors.providerName?.message}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register("sentDate", {
                    required: "Fecha de envío requerida",
                  })}
                  label="Fecha de Envío"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.sentDate}
                  helperText={errors.sentDate?.message}
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register("projectedReturnDate", {
                    required: "Fecha estimada de retorno requerida",
                  })}
                  label="Fecha Estimada de Retorno"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.projectedReturnDate}
                  helperText={errors.projectedReturnDate?.message}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("exitNote")}
                  label="Nota de Salida (Opcional)"
                  placeholder="Ej: Se envía con accesorios, maletín negro"
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Descripción del estado o accesorios enviados"
                />
              </Grid>
            </Grid>

            <Alert severity="warning">
              <Typography variant="body2">
                ⚠️ El equipo se marcará como <strong>EXTERNO</strong> y su
                ubicación física cambiará a laboratorio externo.
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
            color="info"
            startIcon={<Plane size={18} />}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Enviando..." : "Enviar a Externo"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
