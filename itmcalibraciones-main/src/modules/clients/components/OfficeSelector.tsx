import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Plus, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  officeSchema,
  type CreateOrUpdateOfficeDTO,
  type Office,
} from "../types/officeTypes";
import { LocationSelector } from "./LocationSelector";
import { useAllOffices, useOfficeMutation } from "../hooks/useOffices";

interface OfficeSelectorProps {
  clientId?: string;
  onOfficeCreated?: (officeId: string) => void;
  selectedOfficeId?: string;
  onOfficeSelected?: (officeId: string) => void;
}

export const OfficeSelector = ({
  clientId,
  onOfficeCreated,
  selectedOfficeId,
  onOfficeSelected,
}: OfficeSelectorProps) => {
  const [showNewOfficeForm, setShowNewOfficeForm] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const { data: allOffices = [], isLoading } = useAllOffices();
  const { mutate: createOffice, isPending } = useOfficeMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrUpdateOfficeDTO>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      client: clientId || "",
      name: "",
      city: "",
    },
  });

  const city = watch("city");

  // Actualizar el campo client cuando cambie la prop clientId
  useEffect(() => {
    if (clientId) {
      setValue("client", clientId);
    }
  }, [clientId, setValue]);

  // Efecto para sincronizar selección externa
  useEffect(() => {
    if (selectedOfficeId) {
      const office = allOffices.find((o) => o.id === selectedOfficeId);
      if (office) setSelectedOffice(office);
    } else {
      setSelectedOffice(null);
    }
  }, [selectedOfficeId, allOffices]);

  const handleCreateOffice = (data: CreateOrUpdateOfficeDTO) => {
    console.log("🏢 Creando oficina con datos:", data);
    console.log("✅ Validación pasada!");
    // Creamos la oficina independientemente del cliente
    createOffice(data, {
      onSuccess: (office) => {
        console.log("✅ Oficina creada:", office);
        setShowNewOfficeForm(false);
        setSelectedOffice(office);
        // Notificamos al padre que se creó y seleccionó esta oficina
        onOfficeCreated?.(office.id);
        onOfficeSelected?.(office.id);
      },
      onError: (error) => {
        console.error("❌ Error al crear oficina:", error);
      },
    });
  };

  const handleFormError = (errors: any) => {
    console.log("❌ Errores de validación:", errors);
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <Building size={18} />
        Oficina
      </Typography>

      {!showNewOfficeForm ? (
        <Stack spacing={2}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Autocomplete
              value={selectedOffice}
              onChange={(_, newValue) => {
                setSelectedOffice(newValue);
                if (newValue) {
                  onOfficeSelected?.(newValue.id);
                } else {
                  onOfficeSelected?.("");
                }
              }}
              options={allOffices}
              getOptionLabel={(option) =>
                `${option.name} - ${option.cityData?.name || ""}`
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.cityData?.name}, {option.stateData?.nombre}
                      {option.client && ` • Cliente: ${option.client}`}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Oficina"
                  placeholder="Buscar por nombre o ciudad..."
                />
              )}
              noOptionsText="No se encontraron oficinas"
            />
          )}

          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            onClick={() => setShowNewOfficeForm(true)}
            fullWidth
          >
            Nueva Oficina
          </Button>
        </Stack>
      ) : (
        <>
          {console.log("🔄 RENDERIZANDO FORMULARIO DE OFICINA")}
          <Box
            component="form"
            onSubmit={(e) => {
              console.log("📋 Form onSubmit disparado", e);
              handleSubmit(handleCreateOffice, handleFormError)(e);
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Nombre de la Oficina"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                required
              />

              <LocationSelector
                selectedCityId={city}
                onStateChange={() => {}}
                onCityChange={(cityId) => {
                  console.log("🏙️ Ciudad seleccionada:", cityId);
                  setValue("city", cityId);
                }}
                cityError={errors.city?.message}
              />

              <TextField
                label="Dirección"
                {...register("adress")}
                error={!!errors.adress}
                helperText={errors.adress?.message}
                fullWidth
              />

              <TextField
                label="Responsable"
                {...register("responsable")}
                error={!!errors.responsable}
                helperText={errors.responsable?.message}
                fullWidth
              />

              <TextField
                label="Teléfono"
                {...register("phoneNumber")}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log("❌ Cancelando creación de oficina");
                    setShowNewOfficeForm(false);
                  }}
                  fullWidth
                  disabled={isPending}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isPending}
                  onClick={(e) => {
                    console.log("🔘 BOTÓN CLICKEADO!", e);
                  }}
                >
                  {isPending ? "Guardando..." : "Guardar Oficina"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
