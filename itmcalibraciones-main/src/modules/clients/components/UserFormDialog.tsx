import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  MenuItem,
  Typography,
  Alert,
} from "@mui/material";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useCreateUserMutation } from "../hooks/useClientUsers";
import type { Office } from "../types/officeTypes";

interface FormValues {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  officeId: string;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  offices: Office[];
}

export const UserFormDialog = ({ open, onClose, clientId, offices }: UserFormDialogProps) => {
  const { mutate: createUser, isPending, isError, error } = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: { name: "", lastName: "", email: "", password: "", phoneNumber: "", officeId: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    createUser(
      {
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        password: values.password || undefined,
        phoneNumber: values.phoneNumber || undefined,
        office: values.officeId,
        client: clientId,
        roles: ["USER"],
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}
      >
        Nuevo Contacto / Usuario
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isError && (
              <Alert severity="error">
                {(error as any)?.response?.data?.message ?? "Error al crear el usuario"}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Nombre"
                {...register("name", { required: "Requerido" })}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                required
              />
              <TextField
                label="Apellido"
                {...register("lastName", { required: "Requerido" })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
                required
              />
            </Box>

            <TextField
              label="Email"
              type="email"
              {...register("email", { required: "Requerido" })}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              required
            />

            <TextField
              label="Contraseña"
              type="password"
              {...register("password")}
              fullWidth
              placeholder="Dejar vacío para autogenerar"
              helperText="Si no se completa, se usa '123456' como contraseña inicial"
            />

            <TextField
              label="Teléfono"
              {...register("phoneNumber")}
              fullWidth
            />

            <Controller
              name="officeId"
              control={control}
              rules={{ required: "Debe seleccionar una sucursal" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Sucursal *"
                  error={!!errors.officeId}
                  helperText={errors.officeId?.message ?? "El usuario pertenecerá a esta sucursal"}
                  fullWidth
                >
                  {offices.length === 0 ? (
                    <MenuItem disabled value="">
                      <Typography variant="body2" color="text.secondary">
                        No hay sucursales — creá una primero
                      </Typography>
                    </MenuItem>
                  ) : (
                    offices.map((office) => (
                      <MenuItem key={office._id || office.id} value={office._id || office.id}>
                        {office.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending || offices.length === 0}>
            {isPending ? "Creando..." : "Crear Usuario"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
