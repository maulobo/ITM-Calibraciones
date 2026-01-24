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
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { useTechnicians } from "../hooks/useTechnicians";
import { TechnicianFormDialog } from "../components/TechnicianFormDialog";
import type {
  Technician,
  CreateOrUpdateTechnicianDTO,
} from "../types/technicianTypes";

export const TechniciansPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);

  const {
    technicians,
    isLoading,
    error,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    isCreating,
    isUpdating,
  } = useTechnicians();

  const handleCreate = () => {
    setSelectedTechnician(null);
    setDialogOpen(true);
  };

  const handleEdit = (technician: Technician) => {
    setSelectedTechnician(technician);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este técnico?")) {
      try {
        await deleteTechnician(id);
      } catch (error) {
        console.error("Error al eliminar técnico:", error);
      }
    }
  };

  const handleSubmit = async (data: CreateOrUpdateTechnicianDTO) => {
    try {
      if (selectedTechnician) {
        await updateTechnician({ id: selectedTechnician.id, data });
      } else {
        await createTechnician(data);
      }
    } catch (error) {
      console.error("Error al guardar técnico:", error);
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
        Error al cargar los técnicos: {error.message}
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
          Técnicos
        </Typography>
        <Button
          variant="contained"
          startIcon={<UserPlus size={20} />}
          onClick={handleCreate}
        >
          Nuevo Técnico
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
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {technicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay técnicos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              technicians.map((technician) => (
                <TableRow key={technician.id} hover>
                  <TableCell>
                    {technician.name} {technician.lastName}
                  </TableCell>
                  <TableCell>{technician.email}</TableCell>
                  <TableCell>{technician.phoneNumber || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label="Técnico"
                      size="small"
                      color="info"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(technician)}
                      color="primary"
                    >
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(technician.id)}
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

      <TechnicianFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        technician={selectedTechnician}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
};
