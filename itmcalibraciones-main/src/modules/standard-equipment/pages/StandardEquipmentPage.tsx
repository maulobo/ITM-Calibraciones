import { useState } from "react";
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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Plus,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useStandardEquipment,
  useDeleteStandardEquipment,
} from "../hooks/useStandardEquipment";
import type { StandardEquipmentStatus, StandardEquipment } from "../types";
import { StandardEquipmentFormDialog } from "../components/StandardEquipmentFormDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const StatusChip = ({ status }: { status: StandardEquipmentStatus }) => {
  const config = {
    ACTIVO: {
      label: "Activo",
      color: "success" as const,
      icon: <CheckCircle size={14} />,
    },
    FUERA_DE_SERVICIO: {
      label: "Fuera de Servicio",
      color: "error" as const,
      icon: <AlertTriangle size={14} />,
    },
    EN_CALIBRACION: {
      label: "En Calibración (Ext)",
      color: "warning" as const,
      icon: <Clock size={14} />,
    },
    VENCIDO: {
      label: "Vencido",
      color: "error" as const,
      icon: <AlertTriangle size={14} />,
    },
  };

  const { label, color, icon } = config[status] || {
    label: status,
    color: "default" as const,
    icon: null,
  };

  return (
    <Chip
      icon={icon as any}
      label={label}
      color={color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: "bold", borderRadius: "8px" }}
    />
  );
};

export const StandardEquipmentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    StandardEquipment | undefined
  >();

  const { data: equipment, isLoading, error } = useStandardEquipment();
  const deleteMutation = useDeleteStandardEquipment();

  const handleCreate = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StandardEquipment) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este patrón?")) {
      deleteMutation.mutate(id);
    }
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
            Patrones de Laboratorio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Equipos estándar utilizados para calibración
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleCreate}
          sx={{
            px: 3,
            py: 1,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
          }}
        >
          Nuevo Patrón
        </Button>
      </Box>

      {/* Grid Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3, textAlign: "center" }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            TOTAL PATRONES
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {equipment?.length || 0}
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            textAlign: "center",
            borderColor: "success.light",
          }}
        >
          <Typography variant="caption" fontWeight="bold" color="success.main">
            ACTIVOS
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {equipment?.filter((e) => e.status === "ACTIVO").length || 0}
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            textAlign: "center",
            borderColor: "error.light",
          }}
        >
          <Typography variant="caption" fontWeight="bold" color="error.main">
            VENCIDOS
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            {equipment?.filter((e) => e.status === "VENCIDO").length || 0}
          </Typography>
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
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">
              Error al cargar los patrones del laboratorio
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "background.neutral" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Código Interno</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Descripción / Modelo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>N° Serie</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Vto. Calibración
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        No hay patrones registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment?.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Typography fontWeight="bold" variant="body2">
                          {item.internalCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {item.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.brand.name} - {item.model.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              item.status === "VENCIDO"
                                ? "error.main"
                                : "text.primary",
                            fontWeight:
                              item.status === "VENCIDO" ? "bold" : "normal",
                          }}
                        >
                          {format(
                            new Date(item.calibrationExpirationDate),
                            "dd/MM/yyyy",
                            { locale: es },
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Cert: {item.certificateNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Ver Detalle">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                navigate(`/standard-equipment/${item._id}`)
                              }
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver Historial">
                            <IconButton size="small">
                              <History size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <StandardEquipmentFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        equipment={selectedItem}
      />
    </Box>
  );
};
