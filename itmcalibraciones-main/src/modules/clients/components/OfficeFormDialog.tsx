import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Autocomplete,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  useTheme,
  alpha,
  Divider,
  Chip,
} from "@mui/material";
import { X, Store, MapPin, Clock, TruckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  officeSchema,
  type CreateOrUpdateOfficeDTO,
  type Office,
} from "../types/officeTypes";
import { useOfficeMutation } from "../hooks/useOffices";
import { useClients } from "../hooks/useClients";
import { LocationSelector } from "./LocationSelector";
import type { Client } from "../types/clientTypes";

interface OfficeFormDialogProps {
  open: boolean;
  onClose: () => void;
  office?: Office | null;
  defaultClientId?: string;
}

export const OfficeFormDialog = ({
  open,
  onClose,
  office,
  defaultClientId,
}: OfficeFormDialogProps) => {
  const theme = useTheme();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { mutate, isPending } = useOfficeMutation();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateOrUpdateOfficeDTO>({
    resolver: zodResolver(officeSchema),
  });

  const selectedCityId = watch("city");

  // Calcular stateId de todas las fuentes posibles
  const stateId = office
    ? // 1. Si city es un objeto y tiene state
      typeof office.city === "object" &&
      office.city !== null &&
      "state" in office.city
      ? (office.city as any).state
      : // 2. Si existe cityData (legacy/backend alternate)
        "cityData" in office && office.cityData?.state
        ? office.cityData.state
        : undefined
    : undefined;

  console.log("OfficeFormDialog - stateId:", stateId);
  console.log("OfficeFormDialog - selectedCityId:", selectedCityId);

  useEffect(() => {
    if (open) {
      if (office) {
        console.log("Resetting form with office data:", office);

        // Extraer el ID del cliente (puede venir como string o como objeto populated)
        const clientId =
          typeof office.client === "object" && office.client
            ? office.client._id || office.client.id
            : office.client;

        // Normalizar los datos antes de resetear el formulario
        // Específicamente, si 'city' es un objeto, extraemos solo el ID
        const normalizedOffice = {
          ...office,
          client: clientId, // Asegurarse de que sea string
          city:
            typeof office.city === "object" && office.city !== null
              ? (office.city as any)._id
              : office.city,
        };

        reset(normalizedOffice);

        // Buscar el cliente correspondiente usando el ID normalizado
        const client = clients.find(
          (c) => c.id === clientId || c._id === clientId,
        );
        console.log("Found client:", client, "for ID:", clientId);
        setSelectedClient(client || null);
      } else {
        reset({
          name: "",
          client: defaultClientId || "",
          city: "",
          responsable: "",
          phoneNumber: "",
          adress: "",
          postalCode: "",
          deliveryInstructions: "",
          receptionHours: "",
        });

        if (defaultClientId) {
          const client = clients.find(
            (c) => c.id === defaultClientId || c._id === defaultClientId,
          );
          setSelectedClient(client || null);
        } else {
          setSelectedClient(null);
        }
      }
    }
  }, [open, office, reset, clients, defaultClientId]);

  const handleFormSubmit = async (data: CreateOrUpdateOfficeDTO) => {
    mutate(data, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  const isEditMode = !!office;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              bgcolor: "primary.main",
              borderRadius: 1.5,
              display: "flex",
            }}
          >
            <Store size={20} color="white" />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {office ? "Editar Sucursal" : "Nueva Sucursal"}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Header Info */}
            {!isEditMode && selectedClient && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="body2" color="text.secondary">
                    Sucursal de:{" "}
                    <strong>{selectedClient.socialReason}</strong>
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Cliente selector - solo en creación */}
            {isEditMode ? (
              <TextField
                label="Cliente"
                value={selectedClient?.socialReason || "Cargando..."}
                disabled
                fullWidth
                size="small"
                helperText="El cliente no puede modificarse"
              />
            ) : (
              defaultClientId ? (
                // Cliente pre-seleccionado (oculto)
                <input type="hidden" {...register("client")} value={defaultClientId} />
              ) : (
                <Autocomplete
                  value={selectedClient}
                  onChange={(_, newValue) => {
                    setSelectedClient(newValue);
                    setValue("client", newValue?.id || "");
                  }}
                  options={clients}
                  getOptionLabel={(option) => option.socialReason}
                  loading={isLoadingClients}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      required
                      error={!!errors.client}
                      helperText={errors.client?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingClients ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )
            )}

            {/* Identificación */}
            <TextField
              label="Nombre de la Sucursal"
              placeholder="Ej: Base Neuquén, Planta Bahía Blanca"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message || "Nombre descriptivo del lugar"}
              fullWidth
              required
            />

            <Divider>
              <Chip label="Ubicación" size="small" icon={<MapPin size={14} />} />
            </Divider>

            {/* Ubicación */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <LocationSelector
                  selectedStateId={stateId}
                  selectedCityId={selectedCityId}
                  onStateChange={() => {}}
                  onCityChange={(id) => setValue("city", id)}
                  stateError={
                    errors.city ? "Debe seleccionar una provincia" : undefined
                  }
                  cityError={errors.city?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Dirección"
                  placeholder="Ej: Ruta 7 km 10"
                  {...register("adress")}
                  error={!!errors.adress}
                  helperText={errors.adress?.message || "Calle y altura exacta"}
                  fullWidth
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Código Postal"
                  placeholder="8300"
                  {...register("postalCode")}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode?.message}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip label="Contacto" size="small" />
            </Divider>

            {/* Contacto */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Responsable"
                  placeholder="Nombre del encargado"
                  {...register("responsable")}
                  error={!!errors.responsable}
                  helperText={errors.responsable?.message}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Teléfono"
                  placeholder="+54 9 11 XXXX-XXXX"
                  {...register("phoneNumber")}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip label="Logística" size="small" icon={<TruckIcon size={14} />} />
            </Divider>

            {/* Logística */}
            <TextField
              label="Instrucciones de Entrega"
              placeholder='Ej: "Entrar por Portón 3" o "Anunciarse en Garita de Seguridad"'
              {...register("deliveryInstructions")}
              error={!!errors.deliveryInstructions}
              helperText={
                errors.deliveryInstructions?.message ||
                "Indicaciones para el transporte y acceso al lugar"
              }
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Horarios de Recepción"
              placeholder="Ej: Lun a Vie de 8:00 a 15:00 hs"
              {...register("receptionHours")}
              error={!!errors.receptionHours}
              helperText={
                errors.receptionHours?.message ||
                "Horario para recibir entregas"
              }
              fullWidth
              InputProps={{
                startAdornment: <Clock size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} variant="outlined" disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isPending}
            sx={{ minWidth: 120 }}
          >
            {isPending ? "Guardando..." : office ? "Actualizar" : "Crear Sucursal"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
