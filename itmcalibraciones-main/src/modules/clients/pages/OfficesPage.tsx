import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { Building, Pencil, Trash2, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officesApi } from "../api/officesApi";
import type { Office } from "../types/officeTypes";
import { OfficeFormDialog } from "../components/OfficeFormDialog";

export const OfficesPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);

  // Obtener todas las oficinas (necesitaremos crear un endpoint para esto)
  const {
    data: offices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-offices"],
    queryFn: async () => {
      // Por ahora usamos el endpoint sin filtro de cliente
      const response = await officesApi.getAll();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: officesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-offices"] });
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setDeleteDialogOpen(false);
      setOfficeToDelete(null);
    },
  });

  const handleCreate = () => {
    setSelectedOffice(null);
    setDialogOpen(true);
  };

  const handleEdit = (office: Office) => {
    setSelectedOffice(office);
    setDialogOpen(true);
  };

  const handleDeleteClick = (office: Office) => {
    setOfficeToDelete(office);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (officeToDelete) {
      deleteMutation.mutate(officeToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar las oficinas
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Oficinas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Building size={20} />}
          onClick={handleCreate}
        >
          Nueva Oficina
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: 1, borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell>Nombre</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay oficinas registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Building size={18} />
                      {office.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={office.client || "Sin cliente"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <MapPin size={14} />
                      {office.cityName}, {office.stateName}
                    </Box>
                  </TableCell>
                  <TableCell>{office.adress || "-"}</TableCell>
                  <TableCell>{office.responsable || "-"}</TableCell>
                  <TableCell>{office.phoneNumber || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(office)}
                      color="primary"
                    >
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(office)}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <OfficeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        office={selectedOffice}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la oficina{" "}
            <strong>{officeToDelete?.name}</strong>?
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
