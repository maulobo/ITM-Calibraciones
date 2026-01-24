import {
  useEffect,
  useState,
  forwardRef,
  ReactElement,
  Ref,
  ComponentProps,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Box,
  Divider,
  Stack,
  useTheme,
  alpha,
  Slide,
  Chip,
  Grid,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "../types/clientTypes";
import type { CreateOrUpdateClientDTO } from "../types/clientTypes";
import { useClientMutation, useClients } from "../hooks/useClients";
import { LocationSelector } from "./LocationSelector";
import { ClientSearch } from "./ClientSearch";
import type { Client } from "../types/clientTypes";
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
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

const Transition = forwardRef(function Transition(
  props: ComponentProps<typeof Slide> & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  clientToEdit?: CreateOrUpdateClientDTO | null;
  isNewClient?: boolean;
}

export const ClientFormDialog = ({
  open,
  onClose,
  clientToEdit,
  isNewClient = false,
}: ClientFormDialogProps) => {
  const theme = useTheme();
  const { data: allClients = [] } = useClients();
  const { mutate, isPending } = useClientMutation();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrUpdateClientDTO>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      socialReason: "",
      cuit: "",
      city: "",
      email: "",
      responsable: "",
      phoneNumber: "",
      adress: "",
      contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const city = watch("city");

  // Extraer stateId si el cliente tiene cityData populated
  const stateId =
    clientToEdit && "cityData" in clientToEdit && clientToEdit.cityData?.state
      ? clientToEdit.cityData.state
      : undefined;

  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        console.log("ClientFormDialog - Editando cliente:", clientToEdit);
        // Asegurar que contacts sea un array para useFieldArray
        const formValues = {
          ...clientToEdit,
          contacts: (clientToEdit as any).contacts || [],
        };
        reset(formValues);
        setSelectedClient(clientToEdit as Client);
        setShowNewClientForm(true);
      } else {
        reset({
          socialReason: "",
          cuit: "",
          city: "",
          email: "",
          responsable: "",
          phoneNumber: "",
          adress: "",
          contacts: [],
        });
        setSelectedClient(null);
        setShowNewClientForm(isNewClient);
      }
    }
  }, [clientToEdit, reset, open, isNewClient]);

  const handleClientSelected = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      reset(client);
    }
  };

  const handleCreateNew = () => {
    setShowNewClientForm(true);
    setSelectedClient(null);
    reset({
      socialReason: "",
      cuit: "",
      cityName: "",
      stateName: "",
      email: "",
      responsable: "",
      phoneNumber: "",
      contacts: [],
    });
  };

  const onSubmit = (data: CreateOrUpdateClientDTO) => {
    const payload: CreateOrUpdateClientDTO = {
      ...data,
      id: clientToEdit?.id,
    };

    mutate(payload, {
      onSuccess: () => {
        onClose();
        reset();
        setShowNewClientForm(false);
      },
    });
  };

  const SectionHeader = ({
    title,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    subtitle?: string;
    icon: any;
  }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            p: 0.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
            display: "flex",
          }}
        >
          <Icon size={16} />
        </Box>
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: 3.5, fontSize: "0.7rem" }}
        >
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 1, opacity: 0.6 }} />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      scroll="paper"
      disableRestoreFocus
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[12],
          maxHeight: "90vh",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </Typography>
          {clientToEdit && (
            <Chip
              label="Editando"
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: "error.main",
            },
          }}
        >
          <X size={22} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
          <Grid container spacing={3}>
            {/* Paso 1: Buscar o Crear Cliente */}
            {!showNewClientForm && !clientToEdit && (
              <Grid size={{ xs: 12 }}>
                <ClientSearch
                  clients={allClients}
                  selectedClient={selectedClient}
                  onClientSelected={handleClientSelected}
                  onCreateNew={handleCreateNew}
                />
              </Grid>
            )}

            {/* Mostrar formulario solo si se seleccionó "Crear Nuevo" o está editando */}
            {(showNewClientForm || clientToEdit) && (
              <>
                {/* Columna Izquierda */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <SectionHeader
                    title="Información Empresarial"
                    subtitle="Datos fiscales y de contacto principal"
                    icon={Building2}
                  />

                  <Stack spacing={2}>
                    <TextField
                      label="Razón Social"
                      size="small"
                      placeholder="Nombre completo de la empresa"
                      fullWidth
                      variant="outlined"
                      {...register("socialReason")}
                      error={!!errors.socialReason}
                      helperText={errors.socialReason?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Building2
                              size={20}
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="CUIT / CUIL"
                      placeholder="XX-XXXXXXXX-X"
                      fullWidth
                      size="small"
                      {...register("cuit")}
                      error={!!errors.cuit}
                      helperText={errors.cuit?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FileText
                              size={20}
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      }}
                    >
                      <TextField
                        label="Email Corporativo"
                        type="email"
                        placeholder="contacto@empresa.com"
                        fullWidth
                        size="small"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={
                          errors.email?.message ||
                          "⚠️ Se creará automáticamente un usuario con este email"
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                            transition: "all 0.2s",
                            "&:hover": {
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.15)}`,
                            },
                            "&.Mui-focused": {
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.3)}`,
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail
                                size={20}
                                style={{ color: theme.palette.success.main }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Columna Derecha */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <SectionHeader
                    title="Contacto y Ubicación"
                    subtitle="Persona de contacto y dirección"
                    icon={User}
                  />

                  <Stack spacing={2}>
                    <TextField
                      label="Responsable / Contacto"
                      placeholder="Nombre del contacto directo"
                      fullWidth
                      size="small"
                      {...register("responsable")}
                      error={!!errors.responsable}
                      helperText={errors.responsable?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User
                              size={20}
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Teléfono de Contacto"
                      placeholder="+54 9 11 XXXX-XXXX"
                      fullWidth
                      size="small"
                      {...register("phoneNumber")}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              size={20}
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1.5,
                        }}
                      >
                        <MapPin size={14} color={theme.palette.primary.main} />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ fontSize: "0.8rem" }}
                        >
                          Ubicación (Argentina)
                        </Typography>
                      </Box>

                      <LocationSelector
                        selectedStateId={stateId}
                        selectedCityId={city}
                        onStateChange={(stateId) => {
                          setValue("state", stateId);
                        }}
                        onCityChange={(cityId) => {
                          setValue("city", cityId);
                        }}
                        onStateSelect={(state) => {
                          if (state) setValue("stateName", state.nombre);
                        }}
                        onCitySelect={(city) => {
                          if (city) setValue("cityName", city.name);
                        }}
                        cityError={errors.city?.message}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Sección de Contactos Adicionales */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <SectionHeader
                      title="Contactos Adicionales"
                      subtitle="Agrega otros contactos relevantes de la empresa"
                      icon={User}
                    />
                    <Button
                      startIcon={<Plus size={16} />}
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        append({ name: "", email: "", phone: "", role: "" })
                      }
                    >
                      Agregar Contacto
                    </Button>
                  </Box>

                  {fields.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{
                        py: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      No hay contactos adicionales.
                    </Typography>
                  )}

                  <Grid container spacing={2}>
                    {fields.map((field, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={field.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            position: "relative",
                            bgcolor: "background.paper",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => remove(index)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "error.main",
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                          <Stack spacing={2} mt={1}>
                            <TextField
                              label="Nombre"
                              size="small"
                              fullWidth
                              {...register(`contacts.${index}.name` as const)}
                              error={!!errors.contacts?.[index]?.name}
                              helperText={
                                errors.contacts?.[index]?.name?.message
                              }
                            />
                            <TextField
                              label="Email"
                              size="small"
                              fullWidth
                              {...register(`contacts.${index}.email` as const)}
                              error={!!errors.contacts?.[index]?.email}
                              helperText={
                                errors.contacts?.[index]?.email?.message
                              }
                            />
                            <Stack direction="row" spacing={2}>
                              <TextField
                                label="Teléfono"
                                size="small"
                                fullWidth
                                {...register(
                                  `contacts.${index}.phone` as const,
                                )}
                              />
                              <TextField
                                label="Rol / Puesto"
                                size="small"
                                fullWidth
                                {...register(`contacts.${index}.role` as const)}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <Divider />

        {/* Mostrar botones solo si hay formulario visible */}
        {(showNewClientForm || clientToEdit) && (
          <DialogActions
            sx={{
              p: 2,
              bgcolor: "background.paper",
              gap: 1,
            }}
          >
            <Button
              onClick={() => {
                if (showNewClientForm && !clientToEdit) {
                  setShowNewClientForm(false);
                } else {
                  onClose();
                }
              }}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{
                fontWeight: 600,
                px: 2.5,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {showNewClientForm && !clientToEdit ? "Volver" : "Cancelar"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={isPending}
              startIcon={isPending ? null : <Save size={16} />}
              sx={{
                px: 3,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: theme.shadows[3],
                "&:hover": {
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              {isPending ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};
