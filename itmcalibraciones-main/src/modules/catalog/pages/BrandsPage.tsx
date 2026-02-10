import { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import { Plus, X, Tag, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useBrands, useCreateBrand } from "../hooks/useCatalog";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import type { CreateBrandDTO } from "../types";

export const BrandsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Configurar paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  // Obtener datos SIN paginación (backend valida DTOs estrictamente)
  // TODO: Activar cuando el backend haga campos opcionales con @IsOptional()
  const { data: brandsResponse, isLoading, error } = useBrands();
  // { limit: pagination.pageSize, offset: pagination.offset }

  // Actualizar total cuando lleguen los datos
  useEffect(() => {
    if (brandsResponse?.pagination?.total !== undefined) {
      // Forzar actualización del total en el hook de paginación
      const currentTotal = brandsResponse.pagination.total;
      if (currentTotal !== pagination.total) {
        // Ir a la primera página si el total cambió
        pagination.goToPage(1);
      }
    }
  }, [brandsResponse?.pagination?.total]);

  const brands = brandsResponse?.data || [];

  // Calcular qué items mostrar en esta página
  const paginatedBrands = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return brands.slice(start, end);
  }, [brands, pagination.offset, pagination.pageSize]);

  // Actualizar el total cuando cambien los datos
  useEffect(() => {
    pagination.setTotal(brands.length);
  }, [brands.length, pagination]);

  const createMutation = useCreateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrandDTO>();

  const onSubmit = (data: CreateBrandDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
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
            Marcas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las marcas de fabricantes disponibles
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
          Nueva Marca
        </Button>
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
                    <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBrands?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No hay marcas definidas aún
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBrands?.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "primary.light",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </Box>
                          {item.name}
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
                                navigate(`/params/brands/${item._id}/models`)
                              }
                              title="Ver modelos"
                            >
                              <Eye size={18} />
                            </IconButton>
                            <IconButton size="small" title="Editar">
                              <Tag size={18} />
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
            {brandsResponse?.pagination && (
              <PaginationControls
                pagination={{
                  ...pagination,
                  total: brandsResponse.pagination.total,
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
          sx: { borderRadius: "16px", maxWidth: "450px", width: "100%" },
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
            Nueva Marca
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nombre de la Marca"
                placeholder="Ej: Fluke"
                fullWidth
                autoFocus
                {...register("name", { required: "El nombre es requerido" })}
                error={!!errors.name}
                helperText={errors.name?.message}
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
              {createMutation.isPending ? "Guardando..." : "Crear Marca"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
