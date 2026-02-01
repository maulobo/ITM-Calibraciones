import { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from "@mui/material";
import { Plus, X, Box as BoxIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { 
  useModels, 
  useCreateModel, 
  useEquipmentTypes, 
  useBrands 
} from "../hooks/useCatalog";
import type { CreateModelDTO, EquipmentType, Brand } from "../types";

export const ModelsPage = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ brand: "", equipmentType: "" });
  
  // Data Fetching
  const queryFilters = {
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.equipmentType ? { equipmentType: filters.equipmentType } : {})
  };

  const { data: models, isLoading, error } = useModels(queryFilters);
  const { data: types } = useEquipmentTypes();
  const { data: brands } = useBrands();
  
  const createMutation = useCreateModel();
  
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<CreateModelDTO>();

  const onSubmit = (data: CreateModelDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  const getBrandName = (brand: Brand | string) => {
    if (typeof brand === 'string') return brands?.find(b => b._id === brand)?.name || brand;
    return brand.name;
  };

  const getTypeName = (type: EquipmentType | string) => {
    if (typeof type === 'string') return types?.find(t => t._id === type)?.type || type;
    return type.type;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
            Modelos
          </Typography>
          <Typography variant="body1" color="text.secondary">
             Catálogo de modelos unificados por Marca y Tipo
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
          }}
        >
          Nuevo Modelo
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Tipo</InputLabel>
          <Select
            value={filters.equipmentType}
            label="Filtrar por Tipo"
            onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            {types?.map(t => (
              <MenuItem key={t._id} value={t._id}>{t.type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Marca</InputLabel>
          <Select
            value={filters.brand}
            label="Filtrar por Marca"
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          >
            <MenuItem value="">Todas</MenuItem>
            {brands?.map(b => (
              <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      <Card sx={{ borderRadius: "16px", overflow: "hidden", boxShadow: theme.shadows[3] }}>
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Error al cargar los datos</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'background.paper' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo de Equipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {models?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No hay modelos encontrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  models?.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getBrandName(item.brand)} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getTypeName(item.equipmentType)} 
                          size="small" 
                          color="primary" 
                          variant="filled" // Note: Check if variant works in default MUI or use custom style
                          sx={{ bgcolor: "primary.light", color: "primary.contrastText" }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <BoxIcon size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: "16px", maxWidth: "500px", width: "100%" }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Nuevo Modelo</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
             <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
               <TextField
                 label="Nombre del Modelo"
                 placeholder="Ej: Aire 5.0"
                 fullWidth
                 autoFocus
                 {...register("name", { required: "El nombre es requerido" })}
                 error={!!errors.name}
                 helperText={errors.name?.message}
               />
               
               <Controller
                 name="brand"
                 control={control}
                 rules={{ required: "La marca es requerida" }}
                 defaultValue=""
                 render={({ field }) => (
                   <FormControl fullWidth error={!!errors.brand}>
                     <InputLabel>Marca</InputLabel>
                     <Select {...field} label="Marca">
                       {brands?.map(b => (
                         <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                       ))}
                     </Select>
                     {errors.brand && (
                       <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                         {errors.brand.message}
                       </Typography>
                     )}
                   </FormControl>
                 )}
               />

               <Controller
                 name="equipmentType"
                 control={control}
                 rules={{ required: "El tipo es requerido" }}
                 defaultValue=""
                 render={({ field }) => (
                   <FormControl fullWidth error={!!errors.equipmentType}>
                     <InputLabel>Tipo de Equipo</InputLabel>
                     <Select {...field} label="Tipo de Equipo">
                       {types?.map(t => (
                         <MenuItem key={t._id} value={t._id}>{t.type}</MenuItem>
                       ))}
                     </Select>
                     {errors.equipmentType && (
                       <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                         {errors.equipmentType.message}
                       </Typography>
                     )}
                   </FormControl>
                 )}
               />
             </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Guardando..." : "Crear Modelo"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
