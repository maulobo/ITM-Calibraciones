import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Plus, Search, Eye, Edit, Archive, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients, useDeleteClientMutation } from "../hooks/useClients";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import { ClientFormDialog } from "../components/ClientFormDialog";
import type { CreateOrUpdateClientDTO, Client } from "../types/clientTypes";

const AVATAR_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#d97706", "#059669", "#0891b2", "#4f46e5",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const ClientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CreateOrUpdateClientDTO | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const pagination = usePagination({ initialPageSize: 10, initialPage: 1 });

  const { data: clientsResponse, isLoading, isFetching } = useClients({ search: searchTerm });
  const clients = clientsResponse?.data || [];

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClientMutation();

  useEffect(() => { pagination.setTotal(clients.length); }, [clients.length]);
  useEffect(() => { pagination.goToPage(1); }, [searchTerm]);

  const paginatedClients = useMemo(() => {
    const start = pagination.offset;
    return clients.slice(start, start + pagination.pageSize);
  }, [clients, pagination.offset, pagination.pageSize]);

  const handleOpenNew = () => { setSelectedClient(null); setOpenDialog(true); };

  const handleEdit = (client: Client) => {
    setSelectedClient({
      id: client.id || client._id,
      socialReason: client.socialReason,
      cuit: client.cuit,
      city: client.city || "",
      email: client.email || "",
      responsable: client.responsable || "",
      phoneNumber: client.phoneNumber || "",
      adress: client.adress || "",
      contacts: [],
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (client: Client) => { setClientToDelete(client); setDeleteDialogOpen(true); setArchiveError(null); };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id || clientToDelete._id!, {
        onSuccess: () => { setDeleteDialogOpen(false); setClientToDelete(null); setArchiveError(null); },
        onError: (error: any) => {
          setArchiveError(error?.response?.data?.error?.message ?? "Error al archivar el cliente.");
        },
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Clientes
          </Typography>
          <Typography color="text.secondary">
            Gestioná los clientes y sus sucursales
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenNew}>
          Nuevo Cliente
        </Button>
      </Box>

      {/* Buscador */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por razón social, CUIT, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ bgcolor: "background.paper" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isFetching
                  ? <CircularProgress size={20} sx={{ mr: 1, opacity: 0.5 }} />
                  : <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />}
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} variant="outlined" elevation={0} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Razón Social</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>CUIT</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Building2 size={40} style={{ opacity: 0.2 }} />
                    <Typography color="text.secondary">
                      {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
                    </Typography>
                    {!searchTerm && (
                      <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={handleOpenNew}>
                        Agregar primer cliente
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => {
                const name = client.socialReason;
                const color = avatarColor(name);
                const clientId = client.id || client._id;
                const location = [
                  client.cityData?.name || client.cityName,
                  client.stateData?.nombre || client.stateName,
                ].filter(Boolean).join(", ");

                return (
                  <TableRow key={clientId} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: color, color: "#fff", fontWeight: "bold", width: 36, height: 36, fontSize: "0.95rem" }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography fontWeight="500">{name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {client.cuit || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {location || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {client.email || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {client.phoneNumber || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5 }}>
                        <Button
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => navigate(`/clients/${clientId}`)}
                          variant="outlined"
                          color="inherit"
                          sx={{ borderColor: "divider" }}
                        >
                          Ver
                        </Button>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(client)}>
                            <Edit size={15} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Archivar">
                          <IconButton size="small" color="warning" onClick={() => handleDeleteClick(client)}>
                            <Archive size={15} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {!isLoading && clients.length > 0 && (
        <Paper elevation={0} sx={{ mt: 2, p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
          <PaginationControls pagination={{ ...pagination, total: clients.length }} />
        </Paper>
      )}

      {/* Dialogs */}
      <ClientFormDialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); setSelectedClient(null); }}
        clientToEdit={selectedClient}
        isNewClient={!selectedClient}
      />

      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setArchiveError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Archivar cliente</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que querés archivar a <strong>{clientToDelete?.socialReason}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            El cliente dejará de aparecer en las listas pero sus datos y registros históricos quedarán guardados.
          </Typography>
          {archiveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {archiveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDeleteDialogOpen(false); setArchiveError(null); }} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="warning" variant="contained" disabled={isDeleting}>
            {isDeleting ? "Archivando..." : "Archivar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
