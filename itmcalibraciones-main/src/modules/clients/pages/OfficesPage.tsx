import { useState, useMemo, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Plus, Search, Eye, Edit, Archive, Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAllOffices, useDeleteOfficeMutation } from "../hooks/useOffices";
import type { Office } from "../types/officeTypes";
import { OfficeFormDialog } from "../components/OfficeFormDialog";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";

export const OfficesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);

  const { data: offices = [], isLoading, isFetching } = useAllOffices(searchTerm);
  const { mutate: deleteOffice, isPending: isDeleting } = useDeleteOfficeMutation();

  const pagination = usePagination({ initialPageSize: 10, initialPage: 1 });

  useEffect(() => { pagination.setTotal(offices.length); }, [offices.length]);
  useEffect(() => { pagination.goToPage(1); }, [searchTerm]);

  const paginatedOffices = useMemo(() => {
    const start = pagination.offset;
    return offices.slice(start, start + pagination.pageSize);
  }, [offices, pagination.offset, pagination.pageSize]);

  const handleCreate = () => { setSelectedOffice(null); setDialogOpen(true); };
  const handleEdit = (office: Office) => { setSelectedOffice(office); setDialogOpen(true); };
  const handleDeleteClick = (office: Office) => { setOfficeToDelete(office); setDeleteDialogOpen(true); };

  const handleConfirmDelete = () => {
    if (officeToDelete) {
      deleteOffice(officeToDelete.id || officeToDelete._id!, {
        onSuccess: () => { setDeleteDialogOpen(false); setOfficeToDelete(null); },
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Sucursales
          </Typography>
          <Typography color="text.secondary">
            Gestioná las sucursales de tus clientes
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleCreate}>
          Nueva Sucursal
        </Button>
      </Box>

      {/* Buscador */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, cliente, ciudad..."
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
              <TableCell sx={{ fontWeight: 600 }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedOffices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Building2 size={40} style={{ opacity: 0.2 }} />
                    <Typography color="text.secondary">
                      {searchTerm ? "No se encontraron sucursales" : "No hay sucursales registradas"}
                    </Typography>
                    {!searchTerm && (
                      <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={handleCreate}>
                        Agregar primera sucursal
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOffices.map((office) => {
                const officeId = office._id || office.id;
                const clientName =
                  typeof office.client === "object" && office.client
                    ? office.client.socialReason
                    : typeof office.client === "string"
                    ? office.client
                    : "—";
                const location = [office.cityName, office.stateName].filter(Boolean).join(", ");

                return (
                  <TableRow key={officeId} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", fontWeight: "bold", width: 36, height: 36, fontSize: "0.95rem" }}>
                          {office.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography fontWeight="500">{office.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">{clientName}</Typography>
                    </TableCell>
                    <TableCell>
                      {location ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <MapPin size={14} style={{ opacity: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">{location}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{office.adress || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{office.responsable || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{office.phoneNumber || "—"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5 }}>
                        <Button
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => navigate(`/offices/${officeId}`)}
                          variant="outlined"
                          color="inherit"
                          sx={{ borderColor: "divider" }}
                        >
                          Ver
                        </Button>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(office)}>
                            <Edit size={15} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Archivar">
                          <IconButton size="small" color="warning" onClick={() => handleDeleteClick(office)}>
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
      {!isLoading && offices.length > 0 && (
        <Paper elevation={0} sx={{ mt: 2, p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
          <PaginationControls pagination={{ ...pagination, total: offices.length }} />
        </Paper>
      )}

      {/* Dialogs */}
      <OfficeFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedOffice(null); }}
        office={selectedOffice}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Archivar sucursal</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que querés archivar la sucursal <strong>{officeToDelete?.name}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            La sucursal dejará de aparecer en las listas pero sus datos quedarán guardados.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="warning" variant="contained" disabled={isDeleting}>
            {isDeleting ? "Archivando..." : "Archivar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
