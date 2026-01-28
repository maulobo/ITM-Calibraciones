import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  InputAdornment,
  Box,
  Divider,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "../types/clientTypes";
import type { CreateOrUpdateClientDTO } from "../types/clientTypes";
import { useClientMutation } from "../hooks/useClients";
import {
  X,
  Building2,
  FileText,
  Mail,
  User,
  Phone,
  MapPin,
  Map,
  Save,
} from "lucide-react";

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  clientToEdit?: CreateOrUpdateClientDTO | null;
}

export const ClientFormDialog = ({
  open,
  onClose,
  clientToEdit,
}: ClientFormDialogProps) => {
  const theme = useTheme();
  const { mutate, isPending } = useClientMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrUpdateClientDTO>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      socialReason: "",
      cuit: "",
      city: "",
      cityName: "",
      email: "",
      responsable: "",
      phoneNumber: "",
      state: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        reset(clientToEdit);
      } else {
        reset({
          socialReason: "",
          cuit: "",
          city: "",
          cityName: "",
          email: "",
          responsable: "",
          phoneNumber: "",
          state: "",
        });
      }
    }
  }, [clientToEdit, reset, open]);

  const onSubmit = (data: CreateOrUpdateClientDTO) => {
    // Ensure ID is included if we are editing
    const payload: CreateOrUpdateClientDTO = {
      ...data,
      id: clientToEdit?.id,
    };

    mutate(payload, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  const SectionHeader = ({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: any;
  }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, mt: 1 }}>
      <Box
        sx={{
          p: 0.8,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          display: "flex",
        }}
      >
        <Icon size={18} />
      </Box>
      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
        {title}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10],
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 2.5,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {clientToEdit
              ? "Actualiza la información del cliente"
              : "Completa el formulario para registrar un cliente"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Columna Izquierda: Información Principal */}
            <Grid item xs={12} md={6}>
              <SectionHeader title="Datos de la Empresa" icon={Building2} />

              <Stack spacing={2.5}>
                <TextField
                  label="Razón Social"
                  placeholder="Ej: Industrias Wayne S.A."
                  fullWidth
                  variant="outlined"
                  {...register("socialReason")}
                  error={!!errors.socialReason}
                  helperText={errors.socialReason?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building2 size={18} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="CUIT"
                  placeholder="Ej: 30-11223344-5"
                  fullWidth
                  {...register("cuit")}
                  error={!!errors.cuit}
                  helperText={errors.cuit?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FileText size={18} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Email Corporativo"
                  type="email"
                  placeholder="contacto@empresa.com"
                  fullWidth
                  {...register("email")}
                  error={!!errors.email}
                  helperText={
                    errors.email?.message || (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        * Genera usuario de acceso automáticamente
                      </Typography>
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>

            {/* Columna Derecha: Contacto y Ubicación */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <SectionHeader title="Contacto Directo" icon={User} />
                <Stack spacing={2.5}>
                  <TextField
                    label="Nombre del Responsable"
                    placeholder="Ej: Bruce Wayne"
                    fullWidth
                    {...register("responsable")}
                    error={!!errors.responsable}
                    helperText={errors.responsable?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Teléfono"
                    placeholder="+54 11 1234 5678"
                    fullWidth
                    {...register("phoneNumber")}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={18} className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Box>

              <Box>
                <SectionHeader title="Ubicación" icon={MapPin} />
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Ciudad (ID)"
                        placeholder="Mongo ID"
                        fullWidth
                        size="small"
                        {...register("city")}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Nombre Ciudad"
                        placeholder="Ej: Córdoba"
                        fullWidth
                        size="small"
                        {...register("cityName")}
                        error={!!errors.cityName}
                        helperText={errors.cityName?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Provincia / Estado (ID)"
                        placeholder="ID"
                        fullWidth
                        size="small"
                        {...register("state")}
                        error={!!errors.state}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Map size={18} className="text-gray-400" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, bgcolor: "background.default" }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 500 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={<Save size={18} />}
            sx={{ px: 4, py: 1 }}
          >
            {isPending ? "Guardando..." : "Guardar Cliente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
