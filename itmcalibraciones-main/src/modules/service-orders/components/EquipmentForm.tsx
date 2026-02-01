import { useState } from "react";
import { 
  Grid,
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography, 
  Paper,
  Divider,
  FormHelperText,
  Autocomplete,
  Box
} from "@mui/material";
import { Plus, Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useBrands, useEquipmentTypes, useModels } from "../../catalog/hooks/useCatalog";
// import { useEquipments } from "../../equipments/hooks/useEquipments"; // Disabled until backend /equipments is fixed
import { QuickModelCreateModal } from "./QuickModelCreateModal";
import type { ServiceOrderItem } from "../types";

interface EquipmentFormProps {
  onAdd: (item: ServiceOrderItem) => void;
}

export const EquipmentForm = ({ onAdd }: EquipmentFormProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: types } = useEquipmentTypes();
  const { data: brands } = useBrands();
  // TEMPORARILY DISABLED: Backend /equipments endpoint has issues
  // const { data: existingEquipments } = useEquipments(searchTerm);
  const existingEquipments: any[] = []; // Empty array until backend is fixed
  
  // Filter models based on selection
  const { data: models, refetch: refetchModels } = useModels({
    equipmentType: selectedType || undefined,
    brand: selectedBrand || undefined
  });

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceOrderItem>();

  const onSubmit = (data: ServiceOrderItem) => {
    // Find model object for display purposes
    const modelObj = models?.find(m => m._id === data.model);
    
    onAdd({
      ...data,
      _tempId: crypto.randomUUID(),
      _modelData: modelObj
    });

    reset({
      serialNumber: "",
      range: "",
      tag: "",
      model: ""
    });
    setSearchTerm("");
  };

  const handeQuickCreateSuccess = (newModelId: string) => {
    refetchModels().then(() => {
        setValue("model", newModelId);
    });
  };

  const handleEquipmentSelect = (equipment: any) => {
    if (!equipment) return;
    
    // Auto-fill form
    setValue("model", equipment.model._id);
    setValue("serialNumber", equipment.serialNumber);
    setValue("range", equipment.range || "");
    setValue("tag", equipment.tag || "");
    
    // Set filters to match equipment to avoid confusion? 
    // Or just let the model match (it might not be in the current filtered list if type/brand selected diff)
    // Better to reset filters to allow the model to be valid in the dropdown
    setSelectedType(equipment.model.equipmentType._id);
    setSelectedBrand(equipment.model.brand._id);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Agregar Equipo
      </Typography>

      {/* Search Existing */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid #e0e0e0" }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          BUSCAR EQUIPO EXISTENTE (Inventario)
        </Typography>
        <Autocomplete
          options={existingEquipments || []}
          getOptionLabel={(option) => `${option.serialNumber} - ${option.model.name}`}
          onInputChange={(_, value) => setSearchTerm(value)}
          onChange={(_, value) => handleEquipmentSelect(value)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              size="small" 
              placeholder="Escriba serie o modelo..." 
              InputProps={{
                ...params.InputProps,
                startAdornment: <Search size={16} style={{ marginRight: 8, color: "gray" }} />
              }}
            />
          )}
        />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Filters Row */}
          <Grid size={{ xs: 12, md: 4 }}>
             <FormControl fullWidth size="small">
               <InputLabel>1. Filtrar Tipo (Opcional)</InputLabel>
               <Select 
                 value={selectedType} 
                 label="1. Filtrar Tipo (Opcional)"
                 onChange={(e) => setSelectedType(e.target.value)}
               >
                 <MenuItem value="">Todos</MenuItem>
                 {types?.map(t => <MenuItem key={t._id} value={t._id}>{t.type}</MenuItem>)}
               </Select>
             </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
             <FormControl fullWidth size="small">
               <InputLabel>2. Filtrar Marca (Opcional)</InputLabel>
               <Select 
                 value={selectedBrand} 
                 label="2. Filtrar Marca (Opcional)"
                 onChange={(e) => setSelectedBrand(e.target.value)}
               >
                 <MenuItem value="">Todas</MenuItem>
                 {brands?.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
               </Select>
             </FormControl>
          </Grid>

          {/* Model Selector */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="model"
              control={control}
              rules={{ required: "Seleciona un modelo" }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.model}>
                  <InputLabel>3. Modelo *</InputLabel>
                  <Select 
                    {...field} 
                    label="3. Modelo *"
                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  >
                    <MenuItem value="" disabled>Seleccione...</MenuItem>
                    {models?.map(m => (
                      <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                    ))}
                    <Divider />
                    <MenuItem 
                       value="new" 
                       onClick={() => setIsQuickCreateOpen(true)}
                       sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      <Plus size={16} style={{ marginRight: 8 }}/> Nuevo Modelo
                    </MenuItem>
                  </Select>
                  <FormHelperText>{errors.model?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          {/* Details Row */}
          <Grid size={{ xs: 12, md: 4 }}>
             <TextField 
               {...register("serialNumber", { required: "Serie requerida" })}
               label="Número de Serie *" 
               fullWidth 
               size="small" 
               error={!!errors.serialNumber}
               helperText={errors.serialNumber?.message}
             />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
             <TextField 
               {...register("range")}
               label="Rango (Opcional)" 
               fullWidth 
               size="small" 
             />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
             <TextField 
               {...register("tag")}
               label="Tag (Opcional)" 
               fullWidth 
               size="small" 
             />
          </Grid>

          {/* Add Button */}
          <Grid size={{ xs: 12 }}>
            <Button 
               type="submit" 
               variant="contained" 
               startIcon={<Plus size={18} />}
               fullWidth
               sx={{ mt: 1 }}
            >
              Agregar a la lista
            </Button>
          </Grid>
        </Grid>
      </form>

      <QuickModelCreateModal 
        open={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSuccess={handeQuickCreateSuccess}
        preSelectedBrand={selectedBrand}
        preSelectedType={selectedType}
      />
    </Paper>
  );
};
