import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
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
  CircularProgress,
  Alert,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  Paper,
} from "@mui/material";
import {
  ArrowLeft,
  Settings2,
  Search,
  Filter,
  Tag as TagIcon,
  ShoppingBag,
  Info,
} from "lucide-react";
import { useModels, useBrands } from "../hooks/useCatalog";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";

export const BrandModelsPage = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // Configurar paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  // Obtener la marca para mostrar el nombre
  const { data: brandsResponse, isLoading: isLoadingBrands } = useBrands(); // Idealmente useBrand(id)
  const brand = brandsResponse?.data.find((b) => b._id === brandId);

  // Obtener modelos de la marca
  const {
    data: modelsResponse,
    isLoading,
    error,
  } = useModels({
    brand: brandId,
    // limit: pagination.pageSize,
    // offset: pagination.offset,
  });

  const models = modelsResponse?.data || [];

  // Calcular paginación en frontend (temporarlmente hasta activar backend)
  const paginatedModels = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return models.slice(start, end);
  }, [models, pagination.offset, pagination.pageSize]);

  // Actualizar total
  useEffect(() => {
    pagination.setTotal(models.length);
  }, [models.length, pagination]);

  if (isLoading || isLoadingBrands) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Error al cargar los modelos de la marca</Alert>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate("/params/brands")}
          sx={{ mt: 2 }}
        >
          Volver a Marcas
        </Button>
      </Box>
    );
  }

  if (!brand && !isLoadingBrands) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Marca no encontrada</Alert>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate("/params/brands")}
          sx={{ mt: 2 }}
        >
          Volver a Marcas
        </Button>
      </Box>
    );
  }

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
          <TagIcon size={16} />
          Marcas
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          {brand?.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
            }}
          >
            {brand?.name.charAt(0).toUpperCase()}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Modelos {brand?.name}
            </Typography>
            <Typography color="text.secondary">
              Catálogo completo de modelos asociados a esta marca
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "primary.lighter",
              color: "primary.main",
            }}
          >
            <ShoppingBag size={24} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {models.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Modelos
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Content */}
      <Card
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: theme.shadows[3],
        }}
      >
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
                <TableCell sx={{ fontWeight: 600 }}>Tipo de Equipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.100",
                          borderRadius: "50%",
                          mb: 1,
                        }}
                      >
                        <Info size={24} color={theme.palette.text.secondary} />
                      </Box>
                      <Typography color="text.primary" fontWeight={500}>
                        Sin modelos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No hay modelos registrados para esta marca aún.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedModels.map((item) => (
                  <TableRow
                    key={item._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/params/models/${item._id}`)}
                  >
                    <TableCell>
                      <Typography fontWeight={600} color="primary.main">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          typeof item.equipmentType === "object"
                            ? item.equipmentType.type
                            : "Desconocido"
                        }
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 300 }}
                      >
                        {item.description || "Sin descripción"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <Settings2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <PaginationControls
          pagination={{
            ...pagination,
            total: models.length,
          }}
        />
      </Card>
    </Box>
  );
};
