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
} from "@mui/material";
import { X } from "lucide-react";
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
}

export const OfficeFormDialog = ({
  open,
  onClose,
  office,
}: OfficeFormDialogProps) => {
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
    defaultValues: office || {},
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

        // Normalizar los datos antes de resetear el formulario
        // Específicamente, si 'city' es un objeto, extraemos solo el ID
        const normalizedOffice = {
          ...office,
          city:
            typeof office.city === "object" && office.city !== null
              ? (office.city as any)._id
              : office.city,
        };

        reset(normalizedOffice);

        // Buscar el cliente correspondiente
        const client = clients.find((c) => c.id === office.client);
        setSelectedClient(client || null);
      } else {
        reset({
          name: "",
          client: "",
          city: "",
          responsable: "",
          phoneNumber: "",
          adress: "",
        });
        setSelectedClient(null);
      }
    }
  }, [open, office, reset, clients]);

  const handleFormSubmit = async (data: CreateOrUpdateOfficeDTO) => {
    mutate(data, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
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
        {office ? "Editar Oficina" : "Nueva Oficina"}
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Autocomplete
              value={selectedClient}
              onChange={(_, newValue) => {
                setSelectedClient(newValue);
                setValue("client", newValue?.id || "");
              }}
              options={clients}
              getOptionLabel={(option) => option.socialReason}
              loading={isLoadingClients}
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

            <TextField
              label="Nombre de la Oficina"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              required
            />

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
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Guardando..." : office ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
