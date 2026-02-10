import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import {
  ArrowLeft,
  Building2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useClientUsers } from "../hooks/useClientUsers";
import { useAllOffices } from "../hooks/useOffices";

// Mock Data for Instruments (Reused)
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const OfficeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Ideally we would have a fetch by ID, but for now we look in all offices.
  // Assuming useAllOffices fetches all offices in the system or we might rely on the client offices query if we knew the client.
  // Given we don't know the client ID from the URL, we try to use cached data or fetch all.
  const { data: offices = [], isLoading: isLoadingOffice } = useAllOffices();

  const office = useMemo(() => {
    return offices.find((o) => o.id === id || o._id === id);
  }, [offices, id]);

  const clientId =
    typeof office?.client === "object" && office.client !== null
      ? (office.client as any)._id || (office.client as any).id
      : office?.client;

  // Fetch users only if we have a client ID (which we get from the office)
  const { data: allUsers = [], isLoading: isLoadingUsers } = useClientUsers(
    clientId || "",
  );

  const users = useMemo(() => {
    if (!office || !clientId) return [];

    // Determine id to use strictly for filtering
    const officeId = office.id || office._id;
    if (!officeId) return [];

    return allUsers.filter((user) => {
      // Handle both populated object and string ID reference
      const userOfficeId =
        typeof user.office === "object" && user.office !== null
          ? (user.office as any)._id || (user.office as any).id
          : user.office;

      return userOfficeId === officeId;
    });
  }, [allUsers, office, clientId]);

  if (isLoadingOffice) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!office) {
    return (
      <Box p={4}>
        <Alert severity="error">Oficina no encontrada</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }} variant="contained">
          Volver
        </Button>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          color="inherit"
        >
          Volver
        </Button>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Building2 size={28} />
            <Typography variant="h4" fontWeight="bold">
              {office.name}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ID: {office.id || office._id}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="office details tabs"
          >
            <Tab label="Información" />
            <Tab label="Contactos" />
            <Tab label="Instrumentos" />
          </Tabs>
        </Box>

        {/* Information Tab */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body1">{office.adress || "-"}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ciudad
                </Typography>
                <Typography variant="body1">
                  {typeof office.city === "object" && office.city !== null
                    ? (office.city as any).name
                    : office.city || office.cityName || "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Responsable
                </Typography>
                <Typography variant="body1">
                  {office.responsable || "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body1">
                  {office.phoneNumber || "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Instrucciones de Entrega
                </Typography>
                <Typography variant="body1">
                  {office.deliveryInstructions || "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Horarios de Recepción
                </Typography>
                <Typography variant="body1">
                  {office.receptionHours || "-"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Contacts Tab */}
        <CustomTabPanel value={tabValue} index={1}>
          {/* Disclaimer about editing */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Los contactos se gestionan desde el Cliente principal.
          </Alert>
          {isLoadingUsers ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography color="text.secondary">
                No hay usuarios asignados a esta sucursal.
              </Typography>
            </Box>
          ) : (
            <List>
              {users.map((user) => (
                <ListItem key={user.id || (user as any)._id} divider>
                  <ListItemAvatar>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.name} ${user.lastName}`}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {user.email}
                        </Typography>
                        {user.phoneNumber && (
                          <Typography variant="caption" display="block">
                            Tel: {user.phoneNumber}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Chip
                    label="USUARIO"
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.6rem" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CustomTabPanel>

        {/* Instruments Tab (Mock Data) */}
        <CustomTabPanel value={tabValue} index={2}>
          {MOCK_INSTRUMENTS.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No hay instrumentos registrados en esta oficina.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tag</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell>Marca/Modelo</TableCell>
                    <TableCell>Próx. Calibración</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_INSTRUMENTS.map((instrument) => (
                    <TableRow key={instrument.id} hover>
                      <TableCell>{instrument.tag}</TableCell>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {instrument.name}
                      </TableCell>
                      <TableCell>
                        {instrument.brand} {instrument.model}
                      </TableCell>
                      <TableCell>{instrument.nextCalibration}</TableCell>
                      <TableCell>
                        <StatusChip status={instrument.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};
