import { useState, useEffect, useMemo } from "react";
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
  Stack,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Plus, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useServiceOrders } from "../hooks/useServiceOrders";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import type { ServiceOrderStatus } from "../types";

const statusConfig: Record<
  ServiceOrderStatus,
  { label: string; color: "default" | "primary" | "success" | "info" | "error" }
> = {
  PENDING: { label: "Pendiente", color: "default" },
  IN_PROCESS: { label: "En Proceso", color: "primary" },
  FINISHED: { label: "Finalizada", color: "success" },
  DELIVERED: { label: "Entregada", color: "info" },
  CANCELLED: { label: "Cancelada", color: "error" },
};

export const ServiceOrdersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | "ALL">(
    "ALL",
  );

  const pagination = usePagination({ initialPageSize: 10, initialPage: 1 });

  const { data: orders = [], isLoading, error } = useServiceOrders();

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchTerm ||
        o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.client?.socialReason
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        o.contacts?.some((c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        o.office?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || o.generalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    pagination.setTotal(filtered.length);
  }, [filtered.length]);

  useEffect(() => {
    pagination.goToPage(1);
  }, [searchTerm, statusFilter]);

  const paginated = useMemo(() => {
    const start = pagination.offset;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.offset, pagination.pageSize]);

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">
          Error al cargar las órdenes de servicio.
        </Typography>
      </Box>
    );

  return (
    <Box>
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
          <Typography variant="h4" fontWeight="bold">
            Órdenes de Servicio
          </Typography>
          <Typography color="text.secondary">
            Gestión y seguimiento de órdenes de calibración
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate("/service-orders/new")}
        >
          Nueva Orden
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 10,
              color: "gray",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Buscar por código, cliente, oficina o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 36px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ServiceOrderStatus | "ALL")
            }
            displayEmpty
          >
            <MenuItem value="ALL">Todos los estados</MenuItem>
            {Object.entries(statusConfig).map(([value, config]) => (
              <MenuItem key={value} value={value}>
                {config.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabla */}
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Oficina</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Equipos</TableCell>
                <TableCell>Fecha Ingreso</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((order) => {
                const status = statusConfig[order.generalStatus] ?? {
                  label: order.generalStatus,
                  color: "default" as const,
                };
                const calibrated =
                  order.equipments?.filter(
                    (e) => e.technicalState === "CALIBRATED",
                  ).length ?? 0;
                const total = order.equipments?.length ?? 0;

                return (
                  <TableRow
                    key={order._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/service-orders/${order._id}`)}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {order.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order.client?.socialReason ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.office?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.contacts?.[0]?.name ?? "—"}
                        {(order.contacts?.length ?? 0) > 1 && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {" "}
                            +{(order.contacts?.length ?? 0) - 1} más
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <Chip
                          label={`${total} eq`}
                          size="small"
                          variant="outlined"
                        />
                        {calibrated > 0 && (
                          <Chip
                            label={`${calibrated} cal`}
                            size="small"
                            color="success"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {order.entryDate
                          ? format(new Date(order.entryDate), "dd/MM/yyyy")
                          : format(new Date(order.createdAt), "dd/MM/yyyy")}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/service-orders/${order._id}`)}
                        sx={{ color: "info.main" }}
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {orders.length === 0
                        ? "No hay órdenes de servicio registradas."
                        : "No se encontraron resultados para la búsqueda."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filtered.length > 0 && (
          <PaginationControls
            pagination={{ ...pagination, total: filtered.length }}
          />
        )}
      </Paper>
    </Box>
  );
};
