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
import { X, CheckCircle, FileText, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDeliverEquipment } from "../hooks/useEquipments";
import type { Equipment } from "../types";

interface DeliveryDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const DeliveryDialog = ({
  open,
  onClose,
  equipment,
}: DeliveryDialogProps) => {
  const deliverMutation = useDeliverEquipment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    deliveredTo: string;
    retireDate: string;
    remittanceNumber: string;
    certificateNumber?: string;
  }>();

  const onSubmit = (data: {
    deliveredTo: string;
    retireDate: string;
    remittanceNumber: string;
    certificateNumber?: string;
  }) => {
    if (!equipment) return;

    deliverMutation.mutate(
      {
        id: equipment._id,
        dto: {
          deliveredTo: data.deliveredTo,
          retireDate: data.retireDate || undefined,
          remittanceNumber: data.remittanceNumber || undefined,
          certificateNumber: data.certificateNumber || undefined,
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
          bgcolor: "success.main",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle size={22} />
          <Typography variant="h6" fontWeight="bold">
            Registrar Retiro del Cliente
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
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                Información de Entrega
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Completá los datos de salida del equipo
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("deliveredTo", {
                    required: "Nombre de quien retira requerido",
                  })}
                  label="Nombre de quien retira"
                  placeholder="Ej: Juan Pérez"
                  fullWidth
                  error={!!errors.deliveredTo}
                  helperText={errors.deliveredTo?.message ?? "Persona que retira físicamente el equipo"}
                  InputProps={{
                    startAdornment: <User size={18} style={{ marginRight: 8, color: "#6b7280" }} />,
                  }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register("retireDate")}
                  label="Fecha de Retiro"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register("remittanceNumber")}
                  label="N° de Remito"
                  placeholder="Ej: R-0001-9999"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <FileText size={18} style={{ marginRight: 8 }} />
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register("certificateNumber")}
                  label="N° de Certificado (Opcional)"
                  placeholder="Ej: C-2026-555"
                  fullWidth
                  helperText="Si ya se emitió el certificado de calibración"
                />
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                ✅ El equipo se marcará como <strong>ENTREGADO</strong> y el
                servicio se considerará cerrado.
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
            startIcon={<CheckCircle size={18} />}
            disabled={deliverMutation.isPending}
          >
            {deliverMutation.isPending ? "Registrando..." : "Registrar Entrega"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
