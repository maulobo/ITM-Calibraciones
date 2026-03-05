import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Wrench, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyProfile, extractClientId } from "../../users/hooks/useMyProfile";
import { useServiceOrdersByClient } from "../../service-orders/hooks/useServiceOrders";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";

const LOGISTIC_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  RECEIVED:        { label: "Recibido",          color: "primary"  },
  IN_LABORATORY:   { label: "En laboratorio",    color: "warning"  },
  EXTERNAL:        { label: "En laboratorio",    color: "warning"  }, // interno — el cliente no ve "En externo"
  ON_HOLD:         { label: "En espera",         color: "error"    },
  READY_TO_DELIVER:{ label: "Listo para retirar",color: "success"  },
  DELIVERED:       { label: "Entregado",         color: "default"  },
};

const LOGISTIC_FILTERS = [
  { value: "ALL",              label: "Todos" },
  { value: "RECEIVED",         label: "Recibido" },
  { value: "IN_LABORATORY",    label: "En laboratorio" },
  { value: "READY_TO_DELIVER", label: "Listo" },
  { value: "DELIVERED",        label: "Entregado" },
];

export const PortalEquipmentsPage = () => {
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState("ALL");

  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const clientId = extractClientId(profile);
  const { data: serviceOrders = [], isLoading: isLoadingOrders } = useServiceOrdersByClient(clientId);

  // Aggregate all equipment (deduplicated by _id), keep track of which order it came from
  const allEquipment = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{
      _id: string;
      id?: string;
      serialNumber?: string;
      tag?: string;
      range?: string;
      logisticState?: string;
      technicalState?: string;
      orderCode: string;
      orderId: string;
    }> = [];
    for (const order of serviceOrders) {
      for (const eq of order.equipments ?? []) {
        const eqId = eq._id || eq.id;
        if (eqId && !seen.has(eqId)) {
          seen.add(eqId);
          result.push({ ...eq, _id: eqId, orderCode: order.code, orderId: order._id });
        }
      }
    }
    return result;
  }, [serviceOrders]);

  const filtered = useMemo(() => {
    if (stateFilter === "ALL") return allEquipment;
    // EXTERNAL se muestra junto a IN_LABORATORY (el cliente no distingue entre ambos)
    if (stateFilter === "IN_LABORATORY") {
      return allEquipment.filter((eq) => eq.logisticState === "IN_LABORATORY" || eq.logisticState === "EXTERNAL");
    }
    return allEquipment.filter((eq) => eq.logisticState === stateFilter);
  }, [allEquipment, stateFilter]);

  const pagination = usePagination({ initialPageSize: 20, initialPage: 1 });
  const paginated = useMemo(() => {
    return filtered.slice(pagination.offset, pagination.offset + pagination.pageSize);
  }, [filtered, pagination.offset, pagination.pageSize]);

  const isLoading = isLoadingProfile || isLoadingOrders;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.3px">
          Mis Equipos
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {allEquipment.length} {allEquipment.length === 1 ? "equipo registrado" : "equipos registrados"}
        </Typography>
      </Box>

      {/* Logistic state filter */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
        {LOGISTIC_FILTERS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            onClick={() => setStateFilter(value)}
            color={stateFilter === value ? "primary" : "default"}
            variant={stateFilter === value ? "filled" : "outlined"}
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
        ))}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {paginated.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Box sx={{ opacity: 0.15, mb: 2 }}><Wrench size={52} /></Box>
              <Typography color="text.secondary">
                {stateFilter === "ALL" ? "No hay equipos registrados" : "Sin equipos con este estado"}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                    <TableCell>N° Serie</TableCell>
                    <TableCell>Tag</TableCell>
                    <TableCell>Rango</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Orden</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((eq) => {
                    const ls = eq.logisticState ? (LOGISTIC_LABELS[eq.logisticState] ?? { label: eq.logisticState, color: "default" as const }) : null;
                    return (
                      <TableRow
                        key={eq._id}
                        hover
                        sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                        onClick={() => navigate(`/portal/equipment/${eq._id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                            {eq.serialNumber || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {eq.tag
                            ? <Chip label={eq.tag} size="small" sx={{ borderRadius: 1, height: 22, bgcolor: "action.selected", fontWeight: 500, fontSize: "0.75rem" }} />
                            : <Typography variant="caption" color="text.disabled">—</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                          {eq.range || "—"}
                        </TableCell>
                        <TableCell>
                          {ls
                            ? <Chip label={ls.label} color={ls.color} size="small" />
                            : <Typography variant="caption" color="text.disabled">—</Typography>
                          }
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); navigate(`/portal/orders/${eq.orderId}`); }}>
                          <Chip
                            label={eq.orderCode}
                            size="small"
                            variant="outlined"
                            clickable
                            sx={{ fontFamily: "monospace", fontSize: "0.75rem", height: 22, borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Ver equipo">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/portal/equipment/${eq._id}`)}>
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {filtered.length > pagination.pageSize && (
        <Box sx={{ mt: 3 }}>
          <PaginationControls pagination={{ ...pagination, total: filtered.length }} />
        </Box>
      )}
    </Box>
  );
};
