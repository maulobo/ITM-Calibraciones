
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
import type { User } from "../../clients/api/usersApi";
import { useEffect } from "react";

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  user: User;
  isLoading?: boolean;
}

export const ContactFormDialog = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
}: ContactFormDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<User>>({
    defaultValues: user,
  });

  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        client: user.client,
        office: user.office,
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: Partial<User>) => {
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
        Editar Contacto
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Nombre"
              {...register("name", { required: "El nombre es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              required
            />

            <TextField
              label="Apellido"
              {...register("lastName", { required: "El apellido es obligatorio" })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
              required
            />
            </Box>

            <TextField
              label="Email"
              type="email"
              {...register("email", { required: "El email es obligatorio" })}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              required
            />

            <TextField
              label="Teléfono"
              {...register("phoneNumber")}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Actualizar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
