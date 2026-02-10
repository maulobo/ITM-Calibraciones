import {} from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  useCreateModel,
  useBrands,
  useEquipmentTypes,
} from "../../catalog/hooks/useCatalog";
import type { CreateModelDTO } from "../../catalog/types";

interface QuickModelCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newModelId: string) => void;
  preSelectedBrand?: string;
  preSelectedType?: string;
}

export const QuickModelCreateModal = ({
  open,
  onClose,
  onSuccess,
  preSelectedBrand,
  preSelectedType,
}: QuickModelCreateModalProps) => {
  const { data: brandsResponse } = useBrands();
  const brands = brandsResponse?.data || [];
  const { data: typesResponse } = useEquipmentTypes();
  const types = typesResponse?.data || [];
  const createMutation = useCreateModel();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateModelDTO>({
    defaultValues: {
      brand: preSelectedBrand || "",
      equipmentType: preSelectedType || "",
    },
  });

  const onSubmit = (data: CreateModelDTO) => {
    createMutation.mutate(data, {
      onSuccess: (newModel) => {
        onSuccess(newModel._id);
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Nuevo Modelo Rápido
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Nombre del Modelo"
              placeholder="Ej: XT-2000"
              fullWidth
              autoFocus
              {...register("name", { required: "El nombre es requerido" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <Controller
              name="brand"
              control={control}
              rules={{ required: "Marca requerida" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.brand}>
                  <InputLabel>Marca</InputLabel>
                  <Select {...field} label="Marca">
                    {brands?.map((b) => (
                      <MenuItem key={b._id} value={b._id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.brand?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="equipmentType"
              control={control}
              rules={{ required: "Tipo requerido" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.equipmentType}>
                  <InputLabel>Tipo de Equipo</InputLabel>
                  <Select {...field} label="Tipo de Equipo">
                    {types?.map((t) => (
                      <MenuItem key={t._id} value={t._id}>
                        {t.type}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.equipmentType?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                "Crear y Seleccionar"
              )}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
