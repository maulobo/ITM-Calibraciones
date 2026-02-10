import { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { X, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useBrands, useModels } from "../../catalog/hooks/useCatalog";
import {
  useCreateStandardEquipment,
  useUpdateStandardEquipment,
} from "../hooks/useStandardEquipment";
import type { CreateStandardEquipmentDTO, StandardEquipment } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  equipment?: StandardEquipment; // For edit mode
}

export const StandardEquipmentFormDialog = ({
  open,
  onClose,
  equipment,
}: Props) => {
  const [selectedBrand, setSelectedBrand] = useState("");
  const isEdit = !!equipment;

  const { data: brandsResponse } = useBrands();
  const brands = brandsResponse?.data || [];
  const { data: modelsResponse } = useModels({
    brand: selectedBrand || undefined,
  });
  const models = modelsResponse?.data || [];

  const createMutation = useCreateStandardEquipment();
  const updateMutation = useUpdateStandardEquipment();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateStandardEquipmentDTO>();

  useEffect(() => {
    if (equipment) {
      reset({
        internalCode: equipment.internalCode,
        description: equipment.description,
        brand: equipment.brand._id,
        model: equipment.model._id,
        serialNumber: equipment.serialNumber,
        tag: equipment.tag,
        calibrationDate: equipment.calibrationDate.split("T")[0],
        calibrationExpirationDate:
          equipment.calibrationExpirationDate.split("T")[0],
        certificateNumber: equipment.certificateNumber,
        calibrationProvider: equipment.calibrationProvider,
        status: equipment.status,
      });
      setSelectedBrand(equipment.brand._id);
    } else {
      reset({
        internalCode: "",
        description: "",
        brand: "",
        model: "",
        serialNumber: "",
        tag: "",
        calibrationDate: "",
        calibrationExpirationDate: "",
        certificateNumber: "",
        calibrationProvider: "",
        status: "ACTIVO",
      });
      setSelectedBrand("");
    }
  }, [equipment, reset]);

  const onSubmit = (data: CreateStandardEquipmentDTO) => {
    if (isEdit && equipment) {
      updateMutation.mutate(
        { id: equipment._id, dto: data },
        {
          onSuccess: () => {
            onClose();
            reset();
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500, md: 600 },
          backgroundImage: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? "Editar Patrón" : "Nuevo Patrón de Laboratorio"}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <X size={20} />
          </IconButton>
        </Box>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 4 }}>
            <Stack spacing={4}>
              {/* Identificación */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Identificación
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      {...register("internalCode", {
                        required: "Código interno requerido",
                      })}
                      label="Código Interno"
                      fullWidth
                      error={!!errors.internalCode}
                      helperText={errors.internalCode?.message}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      {...register("description", {
                        required: "Descripción requerida",
                      })}
                      label="Descripción del Instrumento"
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Marca y Modelo */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Marca y Modelo
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="brand"
                      control={control}
                      rules={{ required: "Marca requerida" }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.brand} required>
                          <InputLabel>Marca</InputLabel>
                          <Select
                            {...field}
                            label="Marca"
                            onChange={(e) => {
                              field.onChange(e);
                              setSelectedBrand(e.target.value);
                              setValue("model", "");
                            }}
                          >
                            {brands?.map((b) => (
                              <MenuItem key={b._id} value={b._id}>
                                {b.name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors.brand?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="model"
                      control={control}
                      rules={{ required: "Modelo requerido" }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.model} required>
                          <InputLabel>Modelo</InputLabel>
                          <Select
                            {...field}
                            label="Modelo"
                            disabled={!selectedBrand}
                          >
                            {models?.map((m) => (
                              <MenuItem key={m._id} value={m._id}>
                                {m.name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors.model?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("serialNumber", {
                        required: "Número de serie requerido",
                      })}
                      label="Número de Serie"
                      fullWidth
                      error={!!errors.serialNumber}
                      helperText={errors.serialNumber?.message}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("tag")}
                      label="Tag / Etiqueta"
                      fullWidth
                      placeholder="Opcional"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Información de Calibración */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Calibración
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("calibrationProvider", {
                        required: "Proveedor de calibración requerido",
                      })}
                      label="Proveedor de Calibración"
                      placeholder="Ej: INTI, Viditec, Siafa, Emerson"
                      fullWidth
                      error={!!errors.calibrationProvider}
                      helperText={errors.calibrationProvider?.message}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      {...register("calibrationDate", {
                        required: "Fecha requerida",
                      })}
                      label="Fecha Última Calibración"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.calibrationDate}
                      helperText={errors.calibrationDate?.message}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      {...register("calibrationExpirationDate", {
                        required: "Fecha requerida",
                      })}
                      label="Fecha Vencimiento"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.calibrationExpirationDate}
                      helperText={errors.calibrationExpirationDate?.message}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("certificateNumber", {
                        required: "N° Certificado requerido",
                      })}
                      label="N° Certificado"
                      fullWidth
                      error={!!errors.certificateNumber}
                      helperText={errors.certificateNumber?.message}
                      placeholder="Ej: S-234001"
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Estado (solo en edición) */}
              {isEdit && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary.main"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Estado
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select {...field} label="Estado">
                          <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                          <MenuItem value="FUERA_DE_SERVICIO">
                            FUERA DE SERVICIO
                          </MenuItem>
                          <MenuItem value="EN_CALIBRACION">
                            EN CALIBRACIÓN (EXTERNO)
                          </MenuItem>
                          <MenuItem value="VENCIDO">VENCIDO</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              )}
            </Stack>
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={onClose}
                color="inherit"
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{ minWidth: 140 }}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar"
                    : "Crear Patrón"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};
