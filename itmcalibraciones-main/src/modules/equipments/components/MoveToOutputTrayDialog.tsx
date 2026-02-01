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
import { X, PackageCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUpdateEquipment } from "../hooks/useEquipments";
import type { Equipment } from "../types";

interface MoveToOutputTrayDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const MoveToOutputTrayDialog = ({
  open,
  onClose,
  equipment,
}: MoveToOutputTrayDialogProps) => {
  const updateMutation = useUpdateEquipment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ notes?: string }>();

  const onSubmit = () => {
    if (!equipment) return;

    updateMutation.mutate(
      {
        id: equipment._id,
        logisticState: "OUTPUT_TRAY",
        technicalState: "CALIBRATED", // Confirmar calibrado
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
          bgcolor: "warning.main",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PackageCheck size={22} />
          <Typography variant="h6" fontWeight="bold">
            Mover a Bandeja de Salida
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

            <Alert severity="warning">
              <Typography variant="body2">
                El equipo está técnicamente listo pero falta documentación
                administrativa (certificados, remito, factura, etc.).
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Esto moverá el equipo a "Bandeja de Salida" indicando que está
              calibrado pero pendiente de papeles para su retiro.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Moviendo..." : "Mover a Bandeja"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
