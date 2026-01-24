import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  technicianSchema,
  type CreateOrUpdateTechnicianDTO,
  type Technician,
} from "../types/technicianTypes";
import { useEffect } from "react";

interface TechnicianFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrUpdateTechnicianDTO) => Promise<void>;
  technician?: Technician | null;
  isLoading?: boolean;
}

export const TechnicianFormDialog = ({
  open,
  onClose,
  onSubmit,
  technician,
  isLoading,
}: TechnicianFormDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrUpdateTechnicianDTO>({
    resolver: zodResolver(technicianSchema),
    defaultValues: technician || {},
  });

  useEffect(() => {
    if (open) {
      reset(technician || {});
    }
  }, [open, technician, reset]);

  const handleFormSubmit = async (data: CreateOrUpdateTechnicianDTO) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        {technician ? "Editar Técnico" : "Nuevo Técnico"}
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              required
            />

            <TextField
              label="Apellido"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              required
            />

            {!technician && (
              <TextField
                label="Contraseña"
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message || "Mínimo 6 caracteres"}
                fullWidth
                required
              />
            )}

            <TextField
              label="Teléfono"
              {...register("phoneNumber")}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Guardando..." : technician ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
