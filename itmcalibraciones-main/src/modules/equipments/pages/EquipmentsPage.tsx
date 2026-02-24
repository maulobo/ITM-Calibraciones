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
  TablePagination,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
  Divider,
  Checkbox,
  Button,
  Collapse,
  Stack,
  TableSortLabel,
  Skeleton,
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
  FileOutput,
  CheckCircle,
  Inbox,
  ArrowRight,
  Wrench,
  XCircle,
  PackageX,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAllEquipments } from "../hooks/useEquipments";
import { updateEquipment } from "../api";
import { LogisticStateBadge } from "../components/LogisticStateBadge";
import { CalibrationDialog } from "../components/CalibrationDialog";
import { MoveToOutputTrayDialog } from "../components/MoveToOutputTrayDialog";
import { DeliveryDialog } from "../components/DeliveryDialog";
import { SendToExternalLabDialog } from "../components/SendToExternalLabDialog";
import { ReturnFromExternalLabDialog } from "../components/ReturnFromExternalLabDialog";
import { TechnicalResultDialog } from "../components/TechnicalResultDialog";
import { EquipmentLogisticState, type Equipment } from "../types";
import type { NonCalibrationResult } from "../api";

export const EquipmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [otSort, setOtSort] = useState<"asc" | "desc" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Dialogs
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [outputTrayDialog, setOutputTrayDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [externalLabDialog, setExternalLabDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [technicalResultDialog, setTechnicalResultDialog] = useState(false);
  const [technicalResultType, setTechnicalResultType] = useState<NonCalibrationResult>("VERIFIED");

  const { data: equipments, isLoading } = useAllEquipments();

  // Filtrar por búsqueda y estado (cliente-side)
  const filteredEquipments = equipments?.filter((eq) => {
    const matchesState = stateFilter === "ALL" || eq.logisticState === stateFilter;
    if (!matchesState) return false;

    if (tagSearch.length >= 1) {
      const tq = tagSearch.toLowerCase();
      if (!eq.tag?.toLowerCase().includes(tq)) return false;
    }

    if (!search || search.length < 2) return true;
    const q = search.toLowerCase();
    return (
      eq.serialNumber?.toLowerCase().includes(q) ||
      eq.otCode?.toLowerCase().includes(q) ||
      (eq.model as any)?.name?.toLowerCase().includes(q) ||
      (eq.model as any)?.brand?.name?.toLowerCase().includes(q)
    );
  });

  // Estadísticas
  const stats = {
    received:
      equipments?.filter((e) => e.logisticState === EquipmentLogisticState.RECEIVED).length || 0,
    inLab:
      equipments?.filter((e) => e.logisticState === EquipmentLogisticState.IN_LABORATORY).length || 0,
    onHold:
      equipments?.filter((e) => e.logisticState === EquipmentLogisticState.ON_HOLD).length || 0,
    readyToDeliver:
      equipments?.filter((e) => e.logisticState === EquipmentLogisticState.READY_TO_DELIVER).length || 0,
    external:
      equipments?.filter((e) => e.logisticState === EquipmentLogisticState.EXTERNAL).length || 0,
  };

  // --- Selección múltiple ---
  const allVisibleIds = filteredEquipments?.map((e) => e._id) ?? [];
  const allSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allVisibleIds));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // --- Acción en batch: Mover a Laboratorio ---
  const handleBulkMoveToLab = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          updateEquipment({ id, logisticState: EquipmentLogisticState.IN_LABORATORY }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      clearSelection();
    } finally {
      setBulkLoading(false);
    }
  };

  // --- Menú contextual ---
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, equipment: Equipment) => {
    setAnchorEl(event.currentTarget);
    setSelectedEquipment(equipment);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action: string) => {
    handleMenuClose();
    switch (action) {
      case "calibrate":    setCalibrationDialog(true); break;
      case "outputTray":   setOutputTrayDialog(true);  break;
      case "deliver":      setDeliveryDialog(true);    break;
      case "sendExternal": setExternalLabDialog(true); break;
      case "returnExternal": setReturnDialog(true);    break;
      case "verify":
        setTechnicalResultType("VERIFIED");
        setTechnicalResultDialog(true);
        break;
      case "maintenance":
        setTechnicalResultType("MAINTENANCE");
        setTechnicalResultDialog(true);
        break;
      case "outOfService":
        setTechnicalResultType("OUT_OF_SERVICE");
        setTechnicalResultDialog(true);
        break;
      case "returnNoCalib":
        setTechnicalResultType("RETURN_WITHOUT_CALIBRATION");
        setTechnicalResultDialog(true);
        break;
      case "detail":
        if (selectedEquipment) navigate(`/equipments/${selectedEquipment._id}`);
        break;
    }
  };

  // Días en Lab: usa el entryDate del último serviceHistory entry
  const getDaysInLab = (eq: Equipment): number | null => {
    const last = eq.serviceHistory?.[eq.serviceHistory.length - 1];
    if (!last?.entryDate) return null;
    return Math.floor(
      (Date.now() - new Date(last.entryDate).getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  // Cuántos seleccionados son RECEIVED (para la acción batch)
  const selectedReceivedCount = Array.from(selectedIds).filter((id) => {
    const eq = equipments?.find((e) => e._id === id);
    return eq?.logisticState === EquipmentLogisticState.RECEIVED;
  }).length;

  // Cuando el filtro es IN_LABORATORY, ordenar por días en lab desc (más antiguos primero)
  // Si hay sort por OT activo, tiene prioridad
  const sortedEquipments = (() => {
    let base =
      stateFilter === EquipmentLogisticState.IN_LABORATORY && !otSort
        ? [...(filteredEquipments ?? [])].sort(
            (a, b) => (getDaysInLab(b) ?? -1) - (getDaysInLab(a) ?? -1),
          )
        : [...(filteredEquipments ?? [])];

    if (otSort) {
      base.sort((a, b) => {
        const aCode = a.otCode ?? "";
        const bCode = b.otCode ?? "";
        return otSort === "asc"
          ? aCode.localeCompare(bCode)
          : bCode.localeCompare(aCode);
      });
    }
    return base;
  })();

  const paginatedEquipments = sortedEquipments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleOtSort = () => {
    setOtSort((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
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

      {/* Dashboard Cards — sin "Total", con "Recibidos" */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Recibidos */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor: stateFilter === EquipmentLogisticState.RECEIVED ? "warning.lighter" : "background.paper",
              border: stateFilter === EquipmentLogisticState.RECEIVED ? 2 : 1,
              borderColor: stateFilter === EquipmentLogisticState.RECEIVED ? "warning.main" : "divider",
            }}
            onClick={() => { setStateFilter(EquipmentLogisticState.RECEIVED); setPage(0); }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Inbox size={20} color="#f59e0b" />
                <Typography variant="caption" color="text.secondary">Recibidos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.received}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* En Laboratorio */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor: stateFilter === EquipmentLogisticState.IN_LABORATORY ? "primary.lighter" : "background.paper",
              border: stateFilter === EquipmentLogisticState.IN_LABORATORY ? 2 : 1,
              borderColor: stateFilter === EquipmentLogisticState.IN_LABORATORY ? "primary.main" : "divider",
            }}
            onClick={() => { setStateFilter(EquipmentLogisticState.IN_LABORATORY); setPage(0); }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FlaskConical size={20} color="#3b82f6" />
                <Typography variant="caption" color="text.secondary">En Laboratorio</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.inLab}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* En Espera */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor: stateFilter === EquipmentLogisticState.ON_HOLD ? "warning.lighter" : "background.paper",
              border: stateFilter === EquipmentLogisticState.ON_HOLD ? 2 : 1,
              borderColor: stateFilter === EquipmentLogisticState.ON_HOLD ? "warning.main" : "divider",
            }}
            onClick={() => { setStateFilter(EquipmentLogisticState.ON_HOLD); setPage(0); }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FileOutput size={20} color="#f59e0b" />
                <Typography variant="caption" color="text.secondary">En Espera</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.onHold}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Listos */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor: stateFilter === EquipmentLogisticState.READY_TO_DELIVER ? "success.lighter" : "background.paper",
              border: stateFilter === EquipmentLogisticState.READY_TO_DELIVER ? 2 : 1,
              borderColor: stateFilter === EquipmentLogisticState.READY_TO_DELIVER ? "success.main" : "divider",
            }}
            onClick={() => { setStateFilter(EquipmentLogisticState.READY_TO_DELIVER); setPage(0); }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircle size={20} color="#10b981" />
                <Typography variant="caption" color="text.secondary">Listos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.readyToDeliver}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Externos */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              bgcolor: stateFilter === EquipmentLogisticState.EXTERNAL ? "info.lighter" : "background.paper",
              border: stateFilter === EquipmentLogisticState.EXTERNAL ? 2 : 1,
              borderColor: stateFilter === EquipmentLogisticState.EXTERNAL ? "info.main" : "divider",
            }}
            onClick={() => { setStateFilter(EquipmentLogisticState.EXTERNAL); setPage(0); }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Plane size={20} color="#0ea5e9" />
                <Typography variant="caption" color="text.secondary">Externos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.external}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Buscar por S/N, OT, marca, modelo..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
          <TextField
            sx={{ minWidth: 220 }}
            placeholder="Buscar por tag..."
            size="small"
            value={tagSearch}
            onChange={(e) => { setTagSearch(e.target.value); setPage(0); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Tag size={16} color="#64748B" />
                  </InputAdornment>
                ),
              },
            }}
          />
          {(stateFilter !== "ALL" || tagSearch) && (
            <Button
              size="small"
              onClick={() => { setStateFilter("ALL"); setTagSearch(""); setPage(0); }}
              color="inherit"
              sx={{ whiteSpace: "nowrap" }}
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Barra de acciones batch — aparece cuando hay selección */}
      <Collapse in={selectedIds.size > 0}>
        <Paper
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            <strong>{selectedIds.size}</strong>{" "}
            {selectedIds.size === 1 ? "equipo seleccionado" : "equipos seleccionados"}
          </Typography>
          {selectedReceivedCount > 0 && (
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<ArrowRight size={16} />}
              onClick={handleBulkMoveToLab}
              disabled={bulkLoading}
              sx={{ bgcolor: "background.paper", color: "primary.main", "&:hover": { bgcolor: "action.selected" } }}
            >
              {bulkLoading
                ? "Moviendo..."
                : `Mover ${selectedReceivedCount} a Laboratorio`}
            </Button>
          )}
          <Button
            size="small"
            onClick={clearSelection}
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          >
            Cancelar
          </Button>
        </Paper>
      </Collapse>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "background.neutral" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={someSelected && !allSelected}
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <TableSortLabel
                  active={otSort !== null}
                  direction={otSort ?? "asc"}
                  onClick={handleOtSort}
                >
                  OT
                </TableSortLabel>
              </TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>S/N</TableCell>
              <TableCell>Sucursal</TableCell>
              <TableCell>Días en Lab</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5 }} />
                  </TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell>
                    <Skeleton width={140} />
                    <Skeleton width={80} sx={{ mt: 0.5 }} />
                  </TableCell>
                  <TableCell><Skeleton width={90} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={36} height={22} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={90} height={22} /></TableCell>
                  <TableCell align="right">
                    <Skeleton variant="circular" width={28} height={28} sx={{ ml: "auto" }} />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedEquipments.length > 0 ? (
              paginatedEquipments.map((equipment) => {
                const isSelected = selectedIds.has(equipment._id);
                const days = getDaysInLab(equipment);
                const daysColor =
                  days === null ? undefined : days <= 3 ? "success" : days <= 7 ? "warning" : "error";
                return (
                  <TableRow
                    key={equipment._id}
                    hover
                    selected={isSelected}
                    sx={{ cursor: "default" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelect(equipment._id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                        {equipment.otCode ?? "—"}
                      </Typography>
                    </TableCell>
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
                      {equipment.tag && (
                        <Typography variant="caption" color="text.secondary">
                          {equipment.tag}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {equipment.office?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {days !== null ? (
                        <Chip
                          label={`${days} d`}
                          size="small"
                          color={daysColor as any}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5} alignItems="flex-start">
                        <LogisticStateBadge state={equipment.logisticState || ""} size="small" />
                        {equipment.logisticState === EquipmentLogisticState.EXTERNAL && (
                          <Chip
                            icon={<Plane size={12} />}
                            label={equipment.externalProvider?.providerName || "Externo"}
                            size="small"
                            color="info"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, equipment)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {search || stateFilter !== "ALL"
                      ? "No se encontraron equipos con esos filtros"
                      : "No hay equipos registrados"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedEquipments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction("detail")}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Ver Detalle
        </MenuItem>

        {selectedEquipment?.logisticState === EquipmentLogisticState.IN_LABORATORY && (
            <>
              <MenuItem onClick={() => handleAction("calibrate")}>
                <FlaskConical size={16} style={{ marginRight: 8 }} />
                Calibrar Equipo
              </MenuItem>
              <MenuItem onClick={() => handleAction("verify")}>
                <CheckCircle size={16} style={{ marginRight: 8 }} />
                Verificar (sin calibración)
              </MenuItem>
              <MenuItem onClick={() => handleAction("maintenance")}>
                <Wrench size={16} style={{ marginRight: 8 }} />
                Mantenimiento Realizado
              </MenuItem>
              <MenuItem onClick={() => handleAction("outOfService")}>
                <XCircle size={16} style={{ marginRight: 8 }} />
                Fuera de Servicio
              </MenuItem>
              <MenuItem onClick={() => handleAction("returnNoCalib")}>
                <PackageX size={16} style={{ marginRight: 8 }} />
                Devolución sin Calibración
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleAction("sendExternal")}>
                <Plane size={16} style={{ marginRight: 8 }} />
                Enviar a Externo
              </MenuItem>
            </>
          )}

        {["CALIBRATED", "VERIFIED", "MAINTENANCE"].includes(selectedEquipment?.technicalState ?? "") &&
          selectedEquipment?.logisticState !== EquipmentLogisticState.READY_TO_DELIVER && (
            <MenuItem onClick={() => handleAction("outputTray")}>
              <PackageCheck size={16} style={{ marginRight: 8 }} />
              Listo para Retiro
            </MenuItem>
          )}

        {selectedEquipment?.logisticState === EquipmentLogisticState.READY_TO_DELIVER && (
          <MenuItem onClick={() => handleAction("deliver")}>
            <Truck size={16} style={{ marginRight: 8 }} />
            Registrar Entrega
          </MenuItem>
        )}

        {selectedEquipment?.logisticState === EquipmentLogisticState.EXTERNAL && (
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
      <TechnicalResultDialog
        open={technicalResultDialog}
        onClose={() => setTechnicalResultDialog(false)}
        equipment={selectedEquipment}
        result={technicalResultType}
      />
    </Box>
  );
};
