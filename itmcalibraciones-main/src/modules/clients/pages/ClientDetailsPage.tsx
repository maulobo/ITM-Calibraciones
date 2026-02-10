import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Wrench,
  Search,
  Settings,
  Users,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useClients } from "../hooks/useClients";
import { useOfficesByClient } from "../hooks/useOffices";
import { useClientUsers } from "../hooks/useClientUsers";
import { OfficeFormDialog } from "../components/OfficeFormDialog";
import type { Office } from "../types/officeTypes";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from "@mui/material";

// Mock Data for Instruments
const MOCK_INSTRUMENTS = [
  {
    id: 1,
    tag: "ITM-001",
    name: "Manómetro Digital",
    brand: "WIKA",
    model: "CPG1500",
    serial: "123456789",
    lastCalibration: "2025-05-15",
    nextCalibration: "2026-05-15",
    status: "VALID",
  },
  {
    id: 2,
    tag: "ITM-042",
    name: "Termómetro IR",
    brand: "FLUKE",
    model: "62 MAX+",
    serial: "987654321",
    lastCalibration: "2025-02-01",
    nextCalibration: "2026-02-01",
    status: "EXPIRING_SOON",
  },
  {
    id: 3,
    tag: "ITM-105",
    name: "Calibre Pie de Rey",
    brand: "MITUTOYO",
    model: "500-196-30",
    serial: "456789123",
    lastCalibration: "2025-01-10",
    nextCalibration: "2026-01-10",
    status: "EXPIRED",
  },
];

const MOCK_HISTORY = [
  {
    id: "ORD-001",
    date: "2025-12-10",
    instrument: "Manómetro Digital",
    type: "Calibración",
    status: "Completado",
    technician: "Juan Tecnico",
  },
  {
    id: "ORD-002",
    date: "2025-11-05",
    instrument: "Termómetro IR",
    type: "Reparación",
    status: "Completado",
    technician: "Pedro Tecnico",
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case "VALID":
      return (
        <Chip
          label="Vigente"
          color="success"
          size="small"
          icon={<CheckCircle size={14} />}
          variant="outlined"
        />
      );
    case "EXPIRING_SOON":
      return (
        <Chip
          label="Por Vencer"
          color="warning"
          size="small"
          icon={<Clock size={14} />}
          variant="outlined"
        />
      );
    case "EXPIRED":
      return (
        <Chip
          label="Vencido"
          color="error"
          size="small"
          icon={<AlertTriangle size={14} />}
          variant="outlined"
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

export const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleOpenOfficeDetails = (office: Office) => {
    navigate(`/offices/${office.id || office._id}`);
  };

  const { data: clients } = useClients();
  const [tabValue, setTabValue] = useState(0);
  const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const client = clients?.find((c) => c.id === id || c._id === id);

  // Fetch offices for this client
  const clientId = client?._id || client?.id || "";
  const { data: offices = [], isLoading: isLoadingOffices } =
    useOfficesByClient(clientId);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateOffice = () => {
    setSelectedOffice(null);
    setOfficeDialogOpen(true);
  };

  const handleEditOffice = (office: Office) => {
    setSelectedOffice(office);
    setOfficeDialogOpen(true);
  };

  if (!client && clients) {
    return (
      <Box p={4}>
        <Typography>Cliente no encontrado</Typography>
        <Button onClick={() => navigate("/clients")} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          background: "linear-gradient(to right, #ffffff, #f8fafc)",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/clients")}
            color="inherit"
            sx={{
              textTransform: "none",
              color: "text.secondary",
              mb: 1,
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent", color: "text.primary" },
            }}
            disableRipple
          >
            Volver a Clientes
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                fontSize: "1.75rem",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {client.socialReason.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px">
                {client.socialReason}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 0.5, color: "text.secondary" }}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  <FileText size={14} />
                  <Typography variant="body2">{client.cuit}</Typography>
                </Box>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ height: 16, alignSelf: "center" }}
                />
                <Box display="flex" alignItems="center" gap={0.5}>
                  <MapPin size={14} />
                  <Typography variant="body2">
                    {client.cityData?.name || client.cityName || "Global"},{" "}
                    {client.stateData?.nombre || client.stateName || ""}
                  </Typography>
                </Box>
                {client.email && (
                  <>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ height: 16, alignSelf: "center" }}
                    />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Mail size={14} />
                      <Typography variant="body2">{client.email}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                minWidth: 120,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="600"
                textTransform="uppercase"
              >
                Instrumentos
              </Typography>
              <Typography variant="h4" fontWeight=" bold" color="primary.main">
                {MOCK_INSTRUMENTS.length}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                minWidth: 120,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="600"
                textTransform="uppercase"
              >
                Oficinas
              </Typography>
              <Typography variant="h4" fontWeight=" bold" color="primary.main">
                {offices.length}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                minHeight: 56,
              },
            }}
          >
            <Tab
              icon={<Wrench size={18} />}
              iconPosition="start"
              label="Instrumentos"
            />
            <Tab
              icon={<Building2 size={18} />}
              iconPosition="start"
              label="Oficinas"
            />
            <Tab
              icon={<Clock size={18} />}
              iconPosition="start"
              label="Historial de Servicios"
            />
          </Tabs>
        </Box>

        {/* Instruments Tab */}
        <CustomTabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" startIcon={<Wrench size={16} />}>
              Nuevo Instrumento
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tag</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Equipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marca/Modelo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Serie</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Última Cal.</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_INSTRUMENTS.map((instrument) => (
                  <TableRow key={instrument.id} hover>
                    <TableCell>
                      <Chip
                        label={instrument.tag}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          height: 24,
                          bgcolor: "grey.100",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {instrument.name}
                    </TableCell>
                    <TableCell>
                      {instrument.brand}{" "}
                      <Typography
                        component="span"
                        color="text.secondary"
                        variant="body2"
                      >
                        {instrument.model}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {instrument.serial}
                    </TableCell>
                    <TableCell>{instrument.lastCalibration}</TableCell>
                    <TableCell>{instrument.nextCalibration}</TableCell>
                    <TableCell>
                      <StatusChip status={instrument.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {/* Offices Tab */}
        <CustomTabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Building2 size={16} />}
              onClick={handleCreateOffice}
            >
              Nueva Oficina
            </Button>
          </Box>

          {isLoadingOffices ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : offices.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "background.default",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Building2 size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                No hay oficinas registradas
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 3 }}
              >
                Comienza agregando sucursales para gestionar este cliente.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Building2 size={16} />}
                onClick={handleCreateOffice}
              >
                Crear Primera Oficina
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offices.map((office) => (
                    <TableRow key={office._id || office.id} hover>
                      <TableCell
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {office.name}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography variant="body2">
                            {office.cityName || "-"}
                          </Typography>
                          {office.stateName && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({office.stateName})
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{office.adress || "-"}</TableCell>
                      <TableCell>{office.responsable || "-"}</TableCell>
                      <TableCell>{office.phoneNumber || "-"}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            startIcon={<Eye size={14} />}
                            onClick={() => handleOpenOfficeDetails(office)}
                            variant="outlined"
                            sx={{
                              borderColor: "divider",
                              color: "text.primary",
                            }}
                          >
                            Detalles
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleEditOffice(office)}
                            sx={{ minWidth: "auto", p: 1 }}
                          >
                            <Settings size={16} />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CustomTabPanel>

        {/* History Tab */}
        <CustomTabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID Orden</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Equipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo Servicio</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Técnico</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_HISTORY.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {item.id}
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {item.instrument}
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.technician}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">Ver Reporte</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>
      </Paper>

      <OfficeFormDialog
        open={officeDialogOpen}
        onClose={() => setOfficeDialogOpen(false)}
        office={selectedOffice}
      />
    </Box>
  );
};
