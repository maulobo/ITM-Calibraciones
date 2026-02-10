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
  Box,
  Divider,
  Stack,
  useTheme,
  alpha,
  Slide,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Alert,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, contactSchema } from "../types/clientTypes";
import type {
  CreateOrUpdateClientDTO,
  Client,
  ContactDTO,
} from "../types/clientTypes";
import { useClientMutation, useClients } from "../hooks/useClients";
import { useOfficesByClient } from "../hooks/useOffices";
import { useClientUsers, useCreateUserMutation } from "../hooks/useClientUsers";
import { LocationSelector } from "./LocationSelector";
import { ClientSearch } from "./ClientSearch";
import { OfficeFormDialog } from "./OfficeFormDialog";
import {
  X,
  Building2,
  MapPin,
  User,
  Plus,
  Trash2,
  Store,
  Users,
  CheckCircle2,
  FileText,
  ChevronRight,
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

const STEPS = ["Identidad Corporativa", "Sucursales", "Contactos"];

export const ClientFormDialog = ({
  open,
  onClose,
  clientToEdit,
  isNewClient = false,
}: ClientFormDialogProps) => {
  const theme = useTheme();
  const { data: allClients = [] } = useClients();
  const { mutateAsync: saveClient, isPending: isSavingClient } =
    useClientMutation();
  const { mutateAsync: createUser } = useCreateUserMutation();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(0);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Queries for dynamic data
  // Note: We use query mainly to refresh the list, but we can also rely on currentClient updates if we refetch it manually
  // But useOfficesByClient is handy for offices list in Step 2 & 3
  const { data: clientOffices = [], refetch: refetchOffices } =
    useOfficesByClient(currentClient?.id || currentClient?._id);

  // Initialize flow
  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        // Edit mode
        setCurrentClient(clientToEdit as Client);
        setShowNewClientForm(true);
        setActiveStep(0);
      } else if (isNewClient) {
        // Direct new mode
        handleCreateNew();
      } else {
        // Search mode
        setShowNewClientForm(false);
        setCurrentClient(null);
        setActiveStep(0);
      }
    }
  }, [open, clientToEdit, isNewClient]);

  const handleCreateNew = () => {
    setShowNewClientForm(true);
    setCurrentClient(null);
    setActiveStep(0);
  };

  const handleClientSelected = (client: Client | null) => {
    if (client) {
      setCurrentClient(client);
      setShowNewClientForm(true);
      setActiveStep(0);
    }
  };

  const handleNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBackStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // --- Deleted inner component definitions ---

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {currentClient
              ? clientToEdit
                ? "Editar Cliente"
                : currentClient.socialReason
              : "Nuevo Cliente"}
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{ p: 0, flex: 1, display: "flex", flexDirection: "column" }}
        >
          {!showNewClientForm ? (
            <Box sx={{ p: 3 }}>
              <ClientSearch
                clients={allClients}
                selectedClient={currentClient}
                onClientSelected={handleClientSelected}
                onCreateNew={handleCreateNew}
              />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Stepper activeStep={activeStep} alternativeLabel>
                  {STEPS.map((label, index) => (
                    <Step key={label}>
                      <StepButton
                        onClick={() => currentClient && setActiveStep(index)}
                        // Disable future steps if client not created
                        disabled={!currentClient && index > 0}
                      >
                        {label}
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
                {activeStep === 0 && (
                  <StepIdentity
                    currentClient={currentClient}
                    allClients={allClients}
                    saveClient={saveClient}
                    setCurrentClient={setCurrentClient}
                    handleNextStep={handleNextStep}
                    isSavingClient={isSavingClient}
                  />
                )}
                {activeStep === 1 && (
                  <StepOffices
                    currentClient={currentClient}
                    clientOffices={clientOffices}
                    setIsOfficeModalOpen={setIsOfficeModalOpen}
                    handleBackStep={handleBackStep}
                    handleNextStep={handleNextStep}
                  />
                )}
                {activeStep === 2 && (
                  <StepContacts
                    currentClient={currentClient}
                    clientOffices={clientOffices}
                    setIsContactModalOpen={setIsContactModalOpen}
                    handleBackStep={handleBackStep}
                    onClose={onClose}
                    setActiveStep={setActiveStep}
                  />
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <OfficeFormDialog
        open={isOfficeModalOpen}
        onClose={() => {
          setIsOfficeModalOpen(false);
          refetchOffices();
        }}
        defaultClientId={currentClient?.id || currentClient?._id}
      />

      <ContactFormDialog
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        offices={clientOffices}
        onSave={async (contactData) => {
          if (!currentClient) return;
          try {
            await createUser({
              name: contactData.name,
              lastName: contactData.lastName,
              email: contactData.email,
              password: "123456", // Default password as discussed
              roles: ["USER"],
              client: currentClient.id || currentClient._id || "",
              office: contactData.office,
              phoneNumber: contactData.phone,
              area: contactData.area,
            });
            // No need to update currentClient state, the query in StepContacts will refresh automatically
            setIsContactModalOpen(false);

            // Force invalidation of the specific query key used in StepContacts
            queryClient.invalidateQueries({
              queryKey: ["client-users"],
            });
          } catch (e: any) {
            console.error("Failed to save contact/user", e);
            // Optionally set an error state here to show in the dialog
            alert(
              "Error al crear usuario: " + (e.message || "Error desconocido"),
            );
          }
        }}
      />
    </>
  );
};

import { z } from "zod";

const contactUserSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  phone: z.string().optional(),
  office: z.string().min(1, "La sucursal es obligatoria"),
  area: z.string().optional(),
});

type ContactUserForm = z.infer<typeof contactUserSchema>;

import { useQueryClient } from "@tanstack/react-query";

const ContactFormDialog = ({
  open,
  onClose,
  offices,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  offices: any[];
  onSave: (data: ContactUserForm) => void;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ContactUserForm>({
    resolver: zodResolver(contactUserSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      office: "",
      area: "",
    },
  });

  useEffect(() => {
    if (open)
      reset({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        office: "",
        area: "",
      });
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Contacto (Usuario)</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Apellido"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Teléfono"
                placeholder="Ej: +54 9 11 1234-5678"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.office}>
                <InputLabel>Sucursal (Obligatorio)</InputLabel>
                <Controller
                  name="office"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Sucursal (Obligatorio)"
                      value={field.value || ""}
                    >
                      {offices.map((office) => (
                        <MenuItem
                          key={office.id || office._id}
                          value={office.id || office._id}
                        >
                          {office.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.office?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Área" value={field.value || ""}>
                      <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                      <MenuItem value="Administración">Administración</MenuItem>
                      <MenuItem value="Calidad">Calidad</MenuItem>
                      <MenuItem value="Compras">Compras</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Guardar Contacto
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// --- Extracted Components (Moved outside correctly) ---

interface StepIdentityProps {
  currentClient: Client | null;
  allClients: Client[];
  saveClient: (data: CreateOrUpdateClientDTO) => Promise<Client>;
  setCurrentClient: (client: Client) => void;
  handleNextStep: () => void;
  isSavingClient: boolean;
}

const StepIdentity = ({
  currentClient,
  allClients,
  saveClient,
  setCurrentClient,
  handleNextStep,
  isSavingClient,
}: StepIdentityProps) => {
  const theme = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrUpdateClientDTO>({
    resolver: zodResolver(clientSchema),
    defaultValues: currentClient
      ? {
          ...currentClient,
          contacts: currentClient.contacts || [],
        }
      : {
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

  // Watchers for LocationSelector logic
  const city = watch("city");
  const stateId =
    currentClient &&
    "cityData" in currentClient &&
    currentClient.cityData?.state
      ? currentClient.cityData.state
      : undefined;

  const onSubmitIdentity = async (data: CreateOrUpdateClientDTO) => {
    setSubmitError(null);
    try {
      // 1. Client-side Validation for Duplicates
      // We check existing clients list to prevent backend errors (which are hard to catch nicely)
      if (allClients && allClients.length > 0) {
        // Check Duplicate CUIT
        const duplicateCuit = allClients.find(
          (c) =>
            c.cuit === data.cuit &&
            (currentClient
              ? c.id !== currentClient.id && c._id !== currentClient._id
              : true),
        );

        if (duplicateCuit) {
          setSubmitError(
            `El CUIT ${data.cuit} ya existe en el sistema (Cliente: ${duplicateCuit.socialReason}).`,
          );
          return; // Stop here, do not call backend
        }

        // Check Duplicate Social Reason (Case insensitive check usually good practice, but backend might be strict)
        const duplicateName = allClients.find(
          (c) =>
            c.socialReason.trim().toLowerCase() ===
              data.socialReason.trim().toLowerCase() &&
            (currentClient
              ? c.id !== currentClient.id && c._id !== currentClient._id
              : true),
        );

        if (duplicateName) {
          setSubmitError(
            `La razón social "${data.socialReason}" ya existe en el sistema.`,
          );
          return;
        }
      }

      const payload = {
        ...data,
        id: currentClient?.id || currentClient?._id,
      };

      console.log("Submitting client data:", payload);
      const savedClient = await saveClient(payload);

      // Validate response represents a successful creation/update
      if (!savedClient || (!savedClient.id && !savedClient._id)) {
        // Handle case where backend returns simple string message as 200 OK
        if (typeof savedClient === "string") {
          const errorStr = savedClient as string;
          // Map common backend error sub-strings to predictable codes
          if (
            errorStr.includes("E11000") ||
            errorStr.includes("duplicate key") ||
            errorStr.includes("Clave duplicada")
          ) {
            throw new Error("DUPLICATE_KEY_ERROR_DETECTED " + errorStr);
          }
          throw new Error(errorStr);
        }

        // If the response is an object with a message, it might be a soft-error
        const msg =
          (savedClient as any)?.message ||
          (savedClient as any)?.error ||
          "Error desconocido del servidor";
        throw new Error(msg);
      }

      setCurrentClient(savedClient); // Update local state
      handleNextStep();
    } catch (error: any) {
      // Enhanced logging for debugging
      console.group("Error saving client identity");
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      console.groupEnd();

      let errorMessage = "Ha ocurrido un error al guardar la empresa.";

      // Combine possible error sources into one string for checking
      let rawContext = "";
      if (error.message) rawContext += " " + error.message;
      if (error.response?.data) {
        if (typeof error.response.data === "string")
          rawContext += " " + error.response.data;
        else rawContext += " " + JSON.stringify(error.response.data);
      }

      // Check for specific duplicate key error content
      if (
        rawContext.includes("E11000") ||
        rawContext.includes("duplicate key") ||
        rawContext.includes("Clave duplicada") ||
        rawContext.includes("DUPLICATE_KEY_ERROR_DETECTED")
      ) {
        if (rawContext.includes("socialReason")) {
          errorMessage = `La Razón Social "${data.socialReason}" ya está registrada.`;
        } else {
          // Default to CUIT as it is the most common unique constraint
          errorMessage = `El CUIT ${data.cuit} ya está registrado en el sistema.`;
        }
      } else {
        // Use the specific message if available
        if (
          error.message &&
          error.message !== "Error desconocido del servidor" &&
          !error.message.includes("status code 500")
        ) {
          errorMessage = error.message;
        }
        // Or try to use the backend message if available
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (
          typeof error.response?.data === "string" &&
          error.response.data.length < 200
        ) {
          // If the error is a short string, might be the message itself
          errorMessage = error.response.data;
        }
      }

      // If we still have the generic error, append some technical info for the user to report
      if (errorMessage === "Ha ocurrido un error al guardar la empresa.") {
        errorMessage += ` (Detalle: ${error.message || "Sin detalle"})`;
      }

      setSubmitError(errorMessage);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmitIdentity)}
      sx={{ mt: 0, px: 2 }}
    >
      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, lg: 11, xl: 10 }}>
          <Stack spacing={4}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}
            {/* Header Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ py: 2.5, px: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "primary.main",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={28} color="white" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                    >
                      Datos de la Empresa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete la información fiscal y legal de la organización
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Form Fields - Two Column Layout */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Razón Social"
                  placeholder="Ej: Transportadora de Gas del Sur S.A."
                  fullWidth
                  {...register("socialReason")}
                  error={!!errors.socialReason}
                  helperText={errors.socialReason?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building2 size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="CUIT"
                  placeholder="30-12345678-9"
                  fullWidth
                  {...register("cuit")}
                  error={!!errors.cuit}
                  helperText={
                    errors.cuit?.message || "CUIT único registrado en AFIP"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FileText size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Location Section */}
            <Card variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                  <MapPin size={20} color={theme.palette.primary.main} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Domicilio Fiscal
                  </Typography>
                </Stack>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <LocationSelector
                      selectedStateId={stateId}
                      selectedCityId={city}
                      onStateChange={(stateId) => setValue("state", stateId)}
                      onCityChange={(cityId) => setValue("city", cityId)}
                      onStateSelect={(state) => {
                        if (state) setValue("stateName", state.nombre);
                      }}
                      onCitySelect={(city) => {
                        if (city) setValue("cityName", city.name);
                      }}
                      cityError={errors.city?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("adress")}
                      fullWidth
                      label="Dirección completa"
                      placeholder="Ej: Cecilia Grierson 355, 26º piso"
                      error={!!errors.adress}
                      helperText={errors.adress?.message}
                      multiline
                      rows={2}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 6,
          mb: 2,
          pb: 4,
        }}
      >
        <Button
          variant="contained"
          type="submit"
          disabled={isSavingClient}
          size="large"
          endIcon={
            isSavingClient ? (
              <CheckCircle2 className="animate-spin" />
            ) : (
              <ChevronRight />
            )
          }
          sx={{
            minWidth: 250,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {currentClient ? "Actualizar" : "Crear Empresa y Continuar"}
        </Button>
      </Box>
    </Box>
  );
};

interface StepOfficesProps {
  currentClient: Client | null;
  clientOffices: any[];
  setIsOfficeModalOpen: (open: boolean) => void;
  handleBackStep: () => void;
  handleNextStep: () => void;
}

const StepOffices = ({
  currentClient,
  clientOffices,
  setIsOfficeModalOpen,
  handleBackStep,
  handleNextStep,
}: StepOfficesProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="info.main"
          gutterBottom
        >
          📍 Sucursales y Oficinas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure los lugares físicos donde opera{" "}
          <strong>{currentClient?.socialReason}</strong>. Todos comparten el
          mismo CUIT ({currentClient?.cuit}), pero tienen direcciones y
          contactos propios.
        </Typography>
      </Box>

      {clientOffices.length === 0 ? (
        <Box
          sx={{
            p: 4,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Store
            size={48}
            color={theme.palette.text.disabled}
            style={{ marginBottom: 16 }}
          />
          <Typography color="text.secondary">
            No hay sucursales registradas
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            sx={{ mt: 2 }}
            onClick={() => setIsOfficeModalOpen(true)}
          >
            Agregar Sucursal
          </Button>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: alpha(theme.palette.success.main, 0.06),
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ✅ {clientOffices.length}{" "}
              {clientOffices.length === 1
                ? "sucursal registrada"
                : "sucursales registradas"}{" "}
              para <strong>{currentClient?.socialReason}</strong>
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {clientOffices.map((office) => (
              <Grid size={{ xs: 12, sm: 6 }} key={office.id || office._id}>
                <Card variant="outlined">
                  <CardContent
                    sx={{
                      pb: 1,
                      "&:last-child": { pb: 2 },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <Store size={16} /> {office.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {office.adress}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {office.cityName ? `${office.cityName}, ` : ""}
                          {office.stateName}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                startIcon={<Plus />}
                fullWidth
                sx={{
                  height: "100%",
                  minHeight: 100,
                  borderStyle: "dashed",
                }}
                onClick={() => setIsOfficeModalOpen(true)}
              >
                Agregar Otra Sucursal
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}
      >
        <Button onClick={handleBackStep}>Atrás</Button>
        <Button variant="contained" onClick={handleNextStep}>
          Siguiente: Contactos
        </Button>
      </Box>
    </Box>
  );
};

interface StepContactsProps {
  currentClient: Client | null;
  clientOffices: any[];
  setIsContactModalOpen: (open: boolean) => void;
  handleBackStep: () => void;
  onClose: () => void;
  setActiveStep: (step: number) => void;
}

const StepContacts = ({
  currentClient,
  clientOffices,
  setIsContactModalOpen,
  handleBackStep,
  onClose,
  setActiveStep,
}: StepContactsProps) => {
  const theme = useTheme();
  // Refetch when entering this step or when client changes
  const {
    data: contacts = [],
    isLoading,
    refetch,
  } = useClientUsers(currentClient?.id || currentClient?._id);

  // Force refetch when component mounts in case of stale data
  useEffect(() => {
    refetch();
  }, [currentClient, refetch]);

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.08),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="success.main"
          gutterBottom
        >
          👥 Personas de Contacto (Usuarios)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona los usuarios que tienen acceso y representan a{" "}
          <strong>{currentClient?.socialReason}</strong>. Cada usuario debe
          estar asociado a una sucursal.
        </Typography>
      </Box>

      {clientOffices.length === 0 && (
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="warning.main"
            gutterBottom
          >
            ⚠️ No hay sucursales registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Debe agregar al menos una sucursal en el paso anterior antes de
            poder registrar contactos.
          </Typography>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setActiveStep(1)}
          >
            Volver al Paso 2: Sucursales
          </Button>
        </Box>
      )}

      {clientOffices.length > 0 && contacts.length === 0 && (
        <Box
          sx={{
            p: 4,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Users
            size={48}
            color={theme.palette.text.disabled}
            style={{ marginBottom: 16 }}
          />
          <Typography color="text.secondary" gutterBottom>
            No hay usuarios registrados
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 2 }}
          >
            Cree un usuario para que pueda acceder al sistema
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => setIsContactModalOpen(true)}
          >
            Nuevo Usuario
          </Button>
        </Box>
      )}

      {clientOffices.length > 0 && contacts.length > 0 && (
        <List
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          {contacts.map((contact, index) => {
            // Handle office matching whether it's an ID string or a populated object
            const contactOfficeId =
              typeof contact.office === "object" && contact.office !== null
                ? (contact.office as any).id || (contact.office as any)._id
                : contact.office;

            const office = clientOffices.find(
              (o) => (o.id || o._id) === contactOfficeId,
            );
            const officeName = office ? office.name : "Sin Sucursal";

            return (
              <div key={contact.id || contact._id || index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600}>
                        {contact.name} {contact.lastName}
                      </Typography>
                    }
                    secondary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        component="span"
                        flexWrap="wrap"
                      >
                        <Chip
                          label="USER"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.6rem",
                          }}
                        />
                        <Typography variant="caption" component="span">
                          {contact.email}
                        </Typography>
                        {contact.phoneNumber && (
                          <>
                            <Typography variant="caption" component="span">
                              •
                            </Typography>
                            <Typography variant="caption" component="span">
                              {contact.phoneNumber}
                            </Typography>
                          </>
                        )}
                        <Typography variant="caption" component="span">
                          •
                        </Typography>
                        <Chip
                          label={officeName}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    {/* Delete logic pending backend endpoint */}
                    {/* 
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteContact(index)}
                        size="small"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                      */}
                  </ListItemSecondaryAction>
                </ListItem>
                {index < contacts.length - 1 && <Divider component="li" />}
              </div>
            );
          })}
        </List>
      )}

      {clientOffices.length > 0 && contacts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<Plus />}
            onClick={() => setIsContactModalOpen(true)}
          >
            Agregar otro usuario
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}
      >
        <Button onClick={handleBackStep}>Atrás</Button>
        <Button variant="contained" color="success" onClick={onClose}>
          Finalizar
        </Button>
      </Box>
    </Box>
  );
};
