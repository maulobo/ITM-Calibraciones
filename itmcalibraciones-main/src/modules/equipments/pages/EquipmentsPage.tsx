import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search,
  MoreVertical,
  Eye,
  FlaskConical,
  PackageCheck,
  Truck,
  Plane,
  Home,
  Package,
  FileOutput,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEquipments } from "../hooks/useEquipments";
import { LogisticStateBadge } from "../components/LogisticStateBadge";
import { CalibrationDialog } from "../components/CalibrationDialog";
import { MoveToOutputTrayDialog } from "../components/MoveToOutputTrayDialog";
import { DeliveryDialog } from "../components/DeliveryDialog";
import { SendToExternalLabDialog } from "../components/SendToExternalLabDialog";
import { ReturnFromExternalLabDialog } from "../components/ReturnFromExternalLabDialog";
import { EquipmentLogisticState, type Equipment } from "../types";

export const EquipmentsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  // Dialogs
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [outputTrayDialog, setOutputTrayDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [externalLabDialog, setExternalLabDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);

  const { data: equipments, isLoading } = useEquipments(search);

  // Filtrar por estado
  const filteredEquipments = equipments?.filter((eq) => {
    if (stateFilter === "ALL") return true;
    return eq.logisticState === stateFilter;
  });

  // Calcular estadísticas
  const stats = {
    total: equipments?.length || 0,
    received:
      equipments?.filter(
        (e) => e.logisticState === EquipmentLogisticState.RECEIVED,
      ).length || 0,
    inLab:
      equipments?.filter(
        (e) => e.logisticState === EquipmentLogisticState.IN_LABORATORY,
      ).length || 0,
    outputTray:
      equipments?.filter(
        (e) => e.logisticState === EquipmentLogisticState.OUTPUT_TRAY,
      ).length || 0,
    readyToDeliver:
      equipments?.filter(
        (e) => e.logisticState === EquipmentLogisticState.READY_TO_DELIVER,
      ).length || 0,
    external: equipments?.filter((e) => e.location === "EXTERNAL").length || 0,
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    equipment: Equipment,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEquipment(equipment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    switch (action) {
      case "calibrate":
        setCalibrationDialog(true);
        break;
      case "outputTray":
        setOutputTrayDialog(true);
        break;
      case "deliver":
        setDeliveryDialog(true);
        break;
      case "sendExternal":
        setExternalLabDialog(true);
        break;
      case "returnExternal":
        setReturnDialog(true);
        break;
      case "detail":
        if (selectedEquipment) {
          navigate(`/equipments/${selectedEquipment._id}`);
        }
        break;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return "-";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Equipos en Laboratorio
        </Typography>
        <Typography color="text.secondary">
          Seguimiento y gestión de equipos del cliente en proceso de calibración
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor:
                stateFilter === "ALL" ? "primary.lighter" : "background.paper",
              border: stateFilter === "ALL" ? 2 : 1,
              borderColor: stateFilter === "ALL" ? "primary.main" : "divider",
            }}
            onClick={() => setStateFilter("ALL")}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Package size={20} color="#3b82f6" />
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor:
                stateFilter === EquipmentLogisticState.IN_LABORATORY
                  ? "primary.lighter"
                  : "background.paper",
              border:
                stateFilter === EquipmentLogisticState.IN_LABORATORY ? 2 : 1,
              borderColor:
                stateFilter === EquipmentLogisticState.IN_LABORATORY
                  ? "primary.main"
                  : "divider",
            }}
            onClick={() => setStateFilter(EquipmentLogisticState.IN_LABORATORY)}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <FlaskConical size={20} color="#3b82f6" />
                <Typography variant="caption" color="text.secondary">
                  En Laboratorio
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.inLab}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor:
                stateFilter === EquipmentLogisticState.OUTPUT_TRAY
                  ? "warning.lighter"
                  : "background.paper",
              border:
                stateFilter === EquipmentLogisticState.OUTPUT_TRAY ? 2 : 1,
              borderColor:
                stateFilter === EquipmentLogisticState.OUTPUT_TRAY
                  ? "warning.main"
                  : "divider",
            }}
            onClick={() => setStateFilter(EquipmentLogisticState.OUTPUT_TRAY)}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <FileOutput size={20} color="#f59e0b" />
                <Typography variant="caption" color="text.secondary">
                  Bandeja Salida
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.outputTray}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor:
                stateFilter === EquipmentLogisticState.READY_TO_DELIVER
                  ? "success.lighter"
                  : "background.paper",
              border:
                stateFilter === EquipmentLogisticState.READY_TO_DELIVER ? 2 : 1,
              borderColor:
                stateFilter === EquipmentLogisticState.READY_TO_DELIVER
                  ? "success.main"
                  : "divider",
            }}
            onClick={() =>
              setStateFilter(EquipmentLogisticState.READY_TO_DELIVER)
            }
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CheckCircle size={20} color="#10b981" />
                <Typography variant="caption" color="text.secondary">
                  Listos
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.readyToDeliver}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              bgcolor: "info.lighter",
              border: 1,
              borderColor: "info.main",
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Plane size={20} color="#0ea5e9" />
                <Typography variant="caption" color="text.secondary">
                  Externos
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.external}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por S/N, marca, modelo..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#64748B" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "background.neutral" }}>
            <TableRow>
              <TableCell>Equipo</TableCell>
              <TableCell>S/N</TableCell>
              <TableCell>Estado Logístico</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Estado Técnico</TableCell>
              <TableCell>Fecha Calibración</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Cargando equipos...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredEquipments && filteredEquipments.length > 0 ? (
              filteredEquipments.map((equipment) => (
                <TableRow key={equipment._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {equipment.model?.brand?.name} {equipment.model?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {equipment.model?.equipmentType?.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {equipment.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <LogisticStateBadge
                      state={equipment.logisticState || ""}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {equipment.location === "EXTERNAL" ? (
                      <Chip
                        icon={<Plane size={14} />}
                        label={
                          equipment.externalProvider?.providerName || "Externo"
                        }
                        size="small"
                        color="info"
                      />
                    ) : (
                      <Chip
                        icon={<Home size={14} />}
                        label="ITM"
                        size="small"
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={equipment.technicalState || "Pendiente"}
                      size="small"
                      color={
                        equipment.technicalState === "CALIBRATED"
                          ? "success"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{formatDate(equipment.calibrationDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, equipment)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {search
                      ? "No se encontraron equipos"
                      : "No hay equipos registrados"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("detail")}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Ver Detalle
        </MenuItem>

        {selectedEquipment?.logisticState ===
          EquipmentLogisticState.IN_LABORATORY &&
          selectedEquipment?.location !== "EXTERNAL" && (
            <>
              <MenuItem onClick={() => handleAction("calibrate")}>
                <FlaskConical size={16} style={{ marginRight: 8 }} />
                Calibrar Equipo
              </MenuItem>
              <MenuItem onClick={() => handleAction("sendExternal")}>
                <Plane size={16} style={{ marginRight: 8 }} />
                Enviar a Externo
              </MenuItem>
            </>
          )}

        {selectedEquipment?.technicalState === "CALIBRATED" &&
          selectedEquipment?.logisticState !==
            EquipmentLogisticState.OUTPUT_TRAY && (
            <MenuItem onClick={() => handleAction("outputTray")}>
              <PackageCheck size={16} style={{ marginRight: 8 }} />
              Mover a Bandeja
            </MenuItem>
          )}

        {(selectedEquipment?.logisticState ===
          EquipmentLogisticState.OUTPUT_TRAY ||
          selectedEquipment?.logisticState ===
            EquipmentLogisticState.READY_TO_DELIVER) && (
          <MenuItem onClick={() => handleAction("deliver")}>
            <Truck size={16} style={{ marginRight: 8 }} />
            Registrar Entrega
          </MenuItem>
        )}

        {selectedEquipment?.location === "EXTERNAL" && (
          <MenuItem onClick={() => handleAction("returnExternal")}>
            <Home size={16} style={{ marginRight: 8 }} />
            Registrar Retorno
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <CalibrationDialog
        open={calibrationDialog}
        onClose={() => setCalibrationDialog(false)}
        equipment={selectedEquipment}
      />

      <MoveToOutputTrayDialog
        open={outputTrayDialog}
        onClose={() => setOutputTrayDialog(false)}
        equipment={selectedEquipment}
      />

      <DeliveryDialog
        open={deliveryDialog}
        onClose={() => setDeliveryDialog(false)}
        equipment={selectedEquipment}
      />

      <SendToExternalLabDialog
        open={externalLabDialog}
        onClose={() => setExternalLabDialog(false)}
        equipment={selectedEquipment}
      />

      <ReturnFromExternalLabDialog
        open={returnDialog}
        onClose={() => setReturnDialog(false)}
        equipment={selectedEquipment}
      />
    </Box>
  );
};
