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
import { Plus, X, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEquipmentTypes, useCreateEquipmentType } from "../hooks/useCatalog";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import type { CreateEquipmentTypeDTO } from "../types";

export const EquipmentTypesPage = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  // Configurar paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  const { data: typesResponse, isLoading, error } = useEquipmentTypes();
  const createMutation = useCreateEquipmentType();

  const types = typesResponse?.data || [];

  // Calcular qué items mostrar en esta página
  const paginatedTypes = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return types.slice(start, end);
  }, [types, pagination.offset, pagination.pageSize]);

  // Actualizar el total cuando cambien los datos
  useEffect(() => {
    pagination.setTotal(types.length);
  }, [types.length, pagination]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEquipmentTypeDTO>();

  const onSubmit = (data: CreateEquipmentTypeDTO) => {
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
            Tipos de Instrumentos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las categorías de equipos disponibles para calibración
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
          Nuevo Tipo
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
                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTypes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No hay tipos definidos aún
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTypes?.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {item.type}
                        </TableCell>
                        <TableCell color="text.secondary">
                          {item.description || "-"}
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

            {/* Controles de paginación */}
            {typesResponse?.pagination && (
              <PaginationControls
                pagination={{
                  ...pagination,
                  total: types.length,
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
            Nuevo Tipo
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nombre del Tipo"
                placeholder="Ej: Manómetro"
                fullWidth
                autoFocus
                {...register("type", { required: "El nombre es requerido" })}
                error={!!errors.type}
                helperText={errors.type?.message}
              />
              <TextField
                label="Descripción"
                placeholder="Descripción opcional..."
                fullWidth
                multiline
                rows={3}
                {...register("description")}
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
              {createMutation.isPending ? "Guardando..." : "Crear Tipo"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
