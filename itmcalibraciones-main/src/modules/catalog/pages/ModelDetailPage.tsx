import { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  Paper,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowLeft,
  Tag,
  BoxIcon,
  Building2,
  FileText,
  Package,
  Settings,
  X,
  Trash2,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  useModel,
  useUpdateModel,
  useDeleteModel,
  useBrands,
  useEquipmentTypes,
} from "../hooks/useCatalog";
import type { CreateModelDTO } from "../types";

export const ModelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: model, isLoading, error } = useModel(id);
  const { data: brandsResponse } = useBrands();
  const { data: typesResponse } = useEquipmentTypes();
  const updateMutation = useUpdateModel();
  const deleteMutation = useDeleteModel();

  const brands = brandsResponse?.data || [];
  const types = typesResponse?.data || [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateModelDTO>();

  // Llenar el formulario cuando se abre el dialog
  useEffect(() => {
    if (model && editDialogOpen) {
      const brandId =
        typeof model.brand === "object" ? model.brand._id : model.brand;
      const equipmentTypeId =
        typeof model.equipmentType === "object"
          ? model.equipmentType._id
          : model.equipmentType;

      reset({
        name: model.name,
        brand: brandId,
        equipmentType: equipmentTypeId,
        description: model.description || "",
      });
    }
  }, [model, editDialogOpen, reset]);

  const onSubmit = (data: CreateModelDTO) => {
    if (!id) return;
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        navigate(-1); // Volver a la página anterior
      },
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !model) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {error ? "Error al cargar el modelo" : "Modelo no encontrado"}
        </Alert>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const brandName = typeof model.brand === "object" ? model.brand.name : "N/A";
  const brandId =
    typeof model.brand === "object" ? model.brand._id : model.brand;
  const equipmentTypeName =
    typeof model.equipmentType === "object" ? model.equipmentType.type : "N/A";

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/params/brands"
          color="inherit"
          underline="hover"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Tag size={16} />
          Marcas
        </Link>
        {brandId && (
          <Link
            component={RouterLink}
            to={`/params/brands/${brandId}/models`}
            color="inherit"
            underline="hover"
          >
            {brandName}
          </Link>
        )}
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          {model.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
              }}
            >
              <Package size={32} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {model.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={brandName}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={equipmentTypeName}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Eliminar
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings size={18} />}
              onClick={() => setEditDialogOpen(true)}
            >
              Editar
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Información Principal */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FileText size={20} />
                Información del Modelo
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Nombre del Modelo
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {model.name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    ID del Sistema
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {model._id}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1">
                    {model.description || "Sin descripción disponible"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Relacionada */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Marca */}
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: theme.shadows[3],
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Tag size={20} />
                  Marca
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: "12px",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                  onClick={() =>
                    brandId && navigate(`/params/brands/${brandId}/models`)
                  }
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {brandName.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {brandName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver todos los modelos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Tipo de Equipo */}
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: theme.shadows[3],
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BoxIcon size={20} />
                  Tipo de Equipo
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: "12px",
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {equipmentTypeName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Categoría del instrumento
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Estadísticas o información adicional */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor:
                theme.palette.mode === "light" ? "grey.50" : "background.paper",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Building2 size={20} />
              Uso en Equipos
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Próximamente: estadísticas de cuántos equipos utilizan este
              modelo.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
            Editar Modelo
          </Typography>
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
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

              <TextField
                label="Descripción"
                placeholder="Descripción opcional del modelo"
                fullWidth
                multiline
                rows={3}
                {...register("description")}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
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
            <strong>{model?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
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
