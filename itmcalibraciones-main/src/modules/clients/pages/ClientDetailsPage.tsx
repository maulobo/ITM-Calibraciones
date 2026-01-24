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
  Card,
  CardContent,
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
} from "lucide-react";
import { useState } from "react";
import { useClients } from "../hooks/useClients";

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
  const { data: clients } = useClients();
  const [tabValue, setTabValue] = useState(0);

  const client = clients?.find((c) => c.id === id || c._id === id);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate("/clients")}
          color="inherit"
        >
          Volver
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {client.socialReason}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip label={client.cuit} size="small" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
              ID: {client.id || client._id}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Client Info */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={0} sx={{ p: 0, overflow: "hidden", border: 1, borderColor: "divider", borderRadius: 3 }}>
            <Box sx={{ p: 3, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "white", color: "primary.main", fontSize: "2rem", fontWeight: "bold" }}>
                        {client.socialReason.charAt(0)}
                    </Avatar>
                </Box>
                <Typography variant="h6" align="center" fontWeight="bold">
                    {client.socialReason}
                </Typography>
                 <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
                    {client.cityData?.name || client.cityName}, {client.stateData?.nombre || client.stateName}
                </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            EMAIL
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <Mail size={16} className="text-gray-500" />
                            <Typography variant="body2">{client.email || "No registrado"}</Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            TELÉFONO
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <Phone size={16} className="text-gray-500" />
                            <Typography variant="body2">{client.phoneNumber || "No registrado"}</Typography>
                        </Box>
                    </Box>
                     <Divider />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            DIRECCIÓN
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <MapPin size={16} className="text-gray-500" />
                            <Typography variant="body2">{client.adress || "No registrada"}</Typography>
                        </Box>
                    </Box>
                    <Divider />
                     <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            RESPONSABLE
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <Building2 size={16} className="text-gray-500" />
                            <Typography variant="body2">{client.responsable || "No registrado"}</Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>
          </Paper>

           {/* Contacts Card */}
           <Paper elevation={0} sx={{ p: 3, mt: 3, border: 1, borderColor: "divider", borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Contactos Adicionales
                </Typography>
                {client.contacts && client.contacts.length > 0 ? (
                    <Stack spacing={2}>
                        {client.contacts.map((contact, index) => (
                            <Box key={index} sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">{contact.name}</Typography>
                                {contact.role && (
                                     <Typography variant="caption" color="text.secondary" display="block">{contact.role}</Typography>
                                )}
                                <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Mail size={14} className="text-gray-400" />
                                        <Typography variant="caption">{contact.email}</Typography>
                                    </Box>
                                    {contact.phone && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Phone size={14} className="text-gray-400" />
                                            <Typography variant="caption">{contact.phone}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">No hay contactos adicionales.</Typography>
                )}
           </Paper>
        </Grid>

        {/* Right Column: Details Tabs */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="client details tabs">
                <Tab label="Instrumentos" icon={<Wrench size={18} />} iconPosition="start" />
                <Tab label="Historial de Servicios" icon={<FileText size={18} />} iconPosition="start" />
                <Tab label="Configuración" icon={<Settings size={18} />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Instruments Tab */}
            <CustomTabPanel value={tabValue} index={0}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, px: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Instrumentos Registrados</Typography>
                    <Button variant="contained" size="small" startIcon={<Wrench size={16} />}>
                        Registrar Instrumento
                    </Button>
                </Box>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tag</TableCell>
                                <TableCell>Instrumento</TableCell>
                                <TableCell>Marca / Modelo</TableCell>
                                <TableCell>Nº Serie</TableCell>
                                <TableCell>Próx. Calibración</TableCell>
                                <TableCell align="right">Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {MOCK_INSTRUMENTS.map((inst) => (
                                <TableRow key={inst.id} hover>
                                    <TableCell sx={{ fontWeight: "medium", color: "primary.main" }}>{inst.tag}</TableCell>
                                    <TableCell>{inst.name}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{inst.brand}</Typography>
                                        <Typography variant="caption" color="text.secondary">{inst.model}</Typography>
                                    </TableCell>
                                    <TableCell>{inst.serial}</TableCell>
                                    <TableCell>{inst.nextCalibration}</TableCell>
                                    <TableCell align="right">
                                        <StatusChip status={inst.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CustomTabPanel>

            {/* Services History Tab */}
            <CustomTabPanel value={tabValue} index={1}>
                <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Historial de Servicios</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nº Orden</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Instrumento</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Técnico</TableCell>
                                    <TableCell align="right">Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {MOCK_HISTORY.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell sx={{ fontWeight: "medium" }}>{order.id}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>{order.instrument}</TableCell>
                                        <TableCell>{order.type}</TableCell>
                                        <TableCell>{order.technician}</TableCell>
                                        <TableCell align="right">
                                            <Chip label={order.status} size="small" color="success" variant="outlined" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </CustomTabPanel>

             {/* Settings Tab */}
             <CustomTabPanel value={tabValue} index={2}>
                <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Configuración del Cliente</Typography>
                     <Typography color="text.secondary">Opciones de configuración específicas para {client.socialReason}.</Typography>
                </Box>
             </CustomTabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
