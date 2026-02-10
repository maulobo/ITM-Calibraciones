import { useState, useEffect, useMemo } from "react";
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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients, useDeleteClientMutation } from "../hooks/useClients";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import { ClientFormDialog } from "../components/ClientFormDialog";
import type { CreateOrUpdateClientDTO, Client } from "../types/clientTypes";

export const ClientsPage = () => {
  const navigate = useNavigate();

  // Configurar paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  // Obtener datos SIN paginación (backend valida DTOs estrictamente)
  // TODO: Activar cuando el backend haga campos opcionales con @IsOptional()
  const { data: clientsResponse, isLoading, error } = useClients();
  // { limit: pagination.pageSize, offset: pagination.offset }

  // Actualizar total cuando lleguen los datos
  useEffect(() => {
    if (clientsResponse?.pagination?.total !== undefined) {
      const currentTotal = clientsResponse.pagination.total;
      if (currentTotal !== pagination.total) {
        pagination.goToPage(1);
      }
    }
  }, [clientsResponse?.pagination?.total]);

  const clients = clientsResponse?.data || [];

  // Calcular qué items mostrar en esta página
  const paginatedClients = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return clients.slice(start, end);
  }, [clients, pagination.offset, pagination.pageSize]);

  // Actualizar el total cuando cambien los datos
  useEffect(() => {
    pagination.setTotal(clients.length);
  }, [clients.length, pagination]);

  const { mutate: deleteClient, isPending: isDeleting } =
    useDeleteClientMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] =
    useState<CreateOrUpdateClientDTO | null>(null);

  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleOpenNew = () => {
    setSelectedClient(null);
    setOpenDialog(true);
  };

  const handleEdit = (client: Client) => {
    // Map Client to DTO
    const dto: CreateOrUpdateClientDTO = {
      id: client.id || client._id,
      socialReason: client.socialReason,
      cuit: client.cuit,
      city: client.city || "",
      email: client.email || "",
      responsable: client.responsable || "",
      phoneNumber: client.phoneNumber || "",
      adress: client.adress || "",
    };
    setSelectedClient(dto);
    setOpenDialog(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id || clientToDelete._id!, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setClientToDelete(null);
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
  };

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          Error al cargar clientes
        </Typography>
        <Paper
          sx={{ p: 2, bgcolor: "grey.100", maxWidth: "100%", overflow: "auto" }}
        >
          <code style={{ fontSize: "0.8rem", color: "#d32f2f" }}>
            {/* @ts-ignore - Axios error typing */}
            {JSON.stringify(error?.response?.data || error.message, null, 2)}
          </code>
        </Paper>
        <Typography variant="caption" color="text.secondary">
          Verifique que el backend esté corriendo y la ruta sea correcta. (Error
          500 = Ruta no existe en backend)
        </Typography>
      </Box>
    );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Clientes
          </Typography>
          <Typography color="text.secondary">
            Gestión de base de datos de clientes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleOpenNew}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell>Razón Social</TableCell>
                <TableCell>CUIT</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClients?.map((row) => (
                <TableRow key={row.id || row._id} hover>
                  <TableCell fontWeight="bold">{row.socialReason}</TableCell>
                  <TableCell>
                    <Chip label={row.cuit} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {row.responsable || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.phoneNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {row.cityData?.name || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.stateData?.nombre || ""}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/clients/${row.id || row._id}`)}
                      sx={{ mr: 1, color: "info.main" }}
                      title="Ver Detalles"
                    >
                      <Eye size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row)}
                      sx={{ mr: 1 }}
                    >
                      <Edit size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(row)}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!clients || clients.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay clientes registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Controles de paginación */}
        {clientsResponse?.pagination && (
          <PaginationControls
            pagination={{
              ...pagination,
              total: clientsResponse.pagination.total,
            }}
          />
        )}
      </Paper>

      <ClientFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        clientToEdit={selectedClient}
        isNewClient={!selectedClient}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar al cliente{" "}
            <strong>{clientToDelete?.socialReason}</strong>?
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
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
