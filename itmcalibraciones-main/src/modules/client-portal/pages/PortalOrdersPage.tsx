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
import { ClipboardList, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyProfile, extractClientId } from "../../users/hooks/useMyProfile";
import { useServiceOrdersByClient } from "../../service-orders/hooks/useServiceOrders";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceOrderStatus } from "../../service-orders/types";

const SO_STATUS: Record<ServiceOrderStatus, { label: string; color: "default" | "info" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Pendiente",  color: "default" },
  IN_PROCESS: { label: "En proceso", color: "info"    },
  FINISHED:   { label: "Terminado",  color: "success" },
  DELIVERED:  { label: "Entregado",  color: "warning" },
  CANCELLED:  { label: "Cancelado",  color: "error"   },
};

const STATUS_FILTERS: Array<{ value: ServiceOrderStatus | "ALL"; label: string }> = [
  { value: "ALL",        label: "Todas" },
  { value: "PENDING",    label: "Pendiente" },
  { value: "IN_PROCESS", label: "En proceso" },
  { value: "FINISHED",   label: "Terminado" },
  { value: "DELIVERED",  label: "Entregado" },
  { value: "CANCELLED",  label: "Cancelado" },
];

const formatDate = (d?: string) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd MMM yyyy", { locale: es }); } catch { return d; }
};

export const PortalOrdersPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | "ALL">("ALL");

  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const clientId = extractClientId(profile);
  const { data: serviceOrders = [], isLoading: isLoadingOrders } = useServiceOrdersByClient(clientId);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return serviceOrders;
    return serviceOrders.filter((o) => o.generalStatus === statusFilter);
  }, [serviceOrders, statusFilter]);

  const pagination = usePagination({ initialPageSize: 15, initialPage: 1 });
  const paginated = useMemo(() => {
    const start = pagination.offset;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.offset, pagination.pageSize]);

  const isLoading = isLoadingProfile || isLoadingOrders;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.3px">
          Mis Órdenes de Servicio
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {serviceOrders.length} {serviceOrders.length === 1 ? "orden registrada" : "órdenes registradas"}
        </Typography>
      </Box>

      {/* Status filter chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
        {STATUS_FILTERS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            onClick={() => setStatusFilter(value)}
            color={statusFilter === value ? "primary" : "default"}
            variant={statusFilter === value ? "filled" : "outlined"}
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
              <Box sx={{ opacity: 0.15, mb: 2 }}><ClipboardList size={52} /></Box>
              <Typography color="text.secondary">
                {statusFilter === "ALL" ? "No hay órdenes registradas" : "No hay órdenes con este estado"}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                    <TableCell>Código</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell align="center">Equipos</TableCell>
                    <TableCell>Vencimiento est.</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((order) => {
                    const s = SO_STATUS[order.generalStatus] ?? { label: order.generalStatus, color: "default" as const };
                    return (
                      <TableRow
                        key={order._id}
                        hover
                        sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                        onClick={() => navigate(`/portal/orders/${order._id}`)}
                      >
                        <TableCell>
                          <Chip
                            label={order.code}
                            size="small"
                            sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "action.selected", borderRadius: 1, height: 24, fontSize: "0.8rem" }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>
                          {order.office?.name ?? "—"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={order.equipments?.length ?? 0} size="small" variant="outlined" sx={{ height: 20 }} />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                          {formatDate(order.estimatedDeliveryDate)}
                        </TableCell>
                        <TableCell>
                          <Chip label={s.label} color={s.color} size="small" />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/portal/orders/${order._id}`)}
                            >
                              <Eye size={15} />
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
