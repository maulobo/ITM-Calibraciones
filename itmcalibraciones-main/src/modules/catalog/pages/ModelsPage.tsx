import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import { Plus, X, Box as BoxIcon, Eye, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  useModels,
  useCreateModel,
  useDeleteModel,
  useEquipmentTypes,
  useBrands,
} from "../hooks/useCatalog";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import type { CreateModelDTO, EquipmentType, Brand } from "../types";

export const ModelsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [filters, setFilters] = useState({ brand: "", equipmentType: "" });

  // Configurar paginación para modelos
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  // Data Fetching SIN paginación (backend valida DTOs estrictamente)
  // TODO: Activar cuando el backend haga campos opcionales con @IsOptional()
  const queryFilters = {
    // limit: pagination.pageSize,
    // offset: pagination.offset,
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.equipmentType ? { equipmentType: filters.equipmentType } : {}),
  };

  const { data: modelsResponse, isLoading, error } = useModels(queryFilters);
  const { data: typesResponse } = useEquipmentTypes();
  const { data: brandsResponse } = useBrands();

  // Actualizar total cuando cambien los datos
  useEffect(() => {
    if (modelsResponse?.pagination?.total !== undefined) {
      const currentTotal = modelsResponse.pagination.total;
      if (currentTotal !== pagination.total) {
        pagination.goToPage(1);
      }
    }
  }, [modelsResponse?.pagination?.total, pagination]);

  const models = modelsResponse?.data || [];
  const types = typesResponse?.data || [];
  const brands = brandsResponse?.data || [];

  // Calcular qué items mostrar en esta página
  const paginatedModels = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return models.slice(start, end);
  }, [models, pagination.offset, pagination.pageSize]);

  // Actualizar el total cuando cambien los datos
  useEffect(() => {
    pagination.setTotal(models.length);
  }, [models.length, pagination]);

  const createMutation = useCreateModel();
  const deleteMutation = useDeleteModel();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateModelDTO>();

  const onSubmit = (data: CreateModelDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  const getBrandName = (brand: Brand | string) => {
    if (typeof brand === "string")
      return brands?.find((b) => b._id === brand)?.name || brand;
    return brand.name;
  };

  const getTypeName = (type: EquipmentType | string) => {
    if (typeof type === "string")
      return types?.find((t) => t._id === type)?.type || type;
    return type.type;
  };

  const handleDeleteClick = (model: { _id: string; name: string }) => {
    setModelToDelete({ id: model._id, name: model.name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!modelToDelete) return;
    deleteMutation.mutate(modelToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setModelToDelete(null);
      },
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
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
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
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
            onChange={(e) =>
              setFilters({ ...filters, equipmentType: e.target.value })
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {types?.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.type}
              </MenuItem>
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
            {brands?.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      <Card
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: theme.shadows[3],
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Error al cargar los datos</Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead
                  sx={{
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "grey.50"
                        : "background.paper",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Tipo de Equipo
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedModels?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No hay modelos definidos aún
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedModels?.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {item.name}
                        </TableCell>
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
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/params/models/${item._id}`)
                              }
                              title="Ver detalle"
                            >
                              <Eye size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(item)}
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Controles de paginación */}
            {modelsResponse?.pagination && (
              <PaginationControls
                pagination={{
                  ...pagination,
                  total: modelsResponse.pagination.total,
                }}
              />
            )}
          </>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: "16px", maxWidth: "500px", width: "100%" },
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
          <Typography variant="h6" fontWeight="bold">
            Nuevo Modelo
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
            >
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
                      {brands?.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.brand && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mx: 2, mt: 0.5 }}
                      >
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
                      {types?.map((t) => (
                        <MenuItem key={t._id} value={t._id}>
                          {t.type}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.equipmentType && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mx: 2, mt: 0.5 }}
                      >
                        {errors.equipmentType.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpen(false)} color="inherit">
              Cancelar
            </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: "16px", maxWidth: "400px", width: "100%" },
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
          <Typography variant="h6" fontWeight="bold">
            Confirmar Eliminación
          </Typography>
          <IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          <Typography variant="body1">
            ¿Estás seguro de que deseas eliminar el modelo{" "}
            <strong>{modelToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={<Trash2 size={18} />}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar Modelo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
