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
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Plus, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useBudgets } from "../hooks/useBudgets";
import { BudgetStatusChip } from "../components/BudgetStatusChip";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import type { BudgetStatus, BudgetType } from "../types";

const BUDGET_TYPES: BudgetType[] = ["Calibración", "Venta", "Alquiler", "Mantenimiento"];

const VAT_LABELS: Record<string, string> = {
  "21":     "21%",
  "10,5":   "10,5%",
  "NO_IVA": "Sin IVA",
  "EXEMPT": "Exento",
};

export const BudgetsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<BudgetType | "ALL">("ALL");

  const pagination = usePagination({ initialPageSize: 10, initialPage: 1 });
  const { data: budgets = [], isLoading, error } = useBudgets();

  const filtered = useMemo(() => {
    return budgets.filter((b) => {
      const clientName = b.office?.client?.socialReason?.toLowerCase() ?? "";
      const officeName = b.office?.name?.toLowerCase() ?? "";
      const code = (b.code ?? `${b.year}-${String(b.number).padStart(5, "0")}`).toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        code.includes(search) ||
        clientName.includes(search) ||
        officeName.includes(search) ||
        b.reference?.toLowerCase().includes(search) ||
        b.attention?.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesType = typeFilter === "ALL" || b.types.includes(typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [budgets, searchTerm, statusFilter, typeFilter]);

  useEffect(() => { pagination.setTotal(filtered.length); }, [filtered.length]);
  useEffect(() => { pagination.goToPage(1); }, [searchTerm, statusFilter, typeFilter]);

  const paginated = useMemo(() => {
    const start = pagination.offset;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.offset, pagination.pageSize]);

  const calcTotal = (details: { totalPrice: number }[]) =>
    details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Error al cargar los presupuestos.</Typography>
      </Box>
    );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Presupuestos</Typography>
          <Typography color="text.secondary">Gestión de cotizaciones y ofertas</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate("/budgets/new")}
        >
          Nuevo Presupuesto
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexGrow: 1, minWidth: 220 }}>
          <Search size={18} style={{ position: "absolute", left: 10, color: "gray", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Buscar por código, cliente, referencia..."
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BudgetStatus | "ALL")}
            displayEmpty
          >
            <MenuItem value="ALL">Todos los estados</MenuItem>
            <MenuItem value="PENDING">En espera</MenuItem>
            <MenuItem value="APPROVED">Aprobado</MenuItem>
            <MenuItem value="REJECTED">No aprobado</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as BudgetType | "ALL")}
            displayEmpty
          >
            <MenuItem value="ALL">Todos los tipos</MenuItem>
            {BUDGET_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
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
                <TableCell>N° Presupuesto</TableCell>
                <TableCell>Cliente / Sucursal</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Moneda</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((budget) => {
                const code = budget.code ?? `${budget.year}-${String(budget.number).padStart(5, "0")}`;
                const total = calcTotal(budget.details);
                return (
                  <TableRow
                    key={budget._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/budgets/${budget._id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {code}
                      </Typography>
                      {budget.reference && (
                        <Typography variant="caption" color="text.secondary">
                          {budget.reference}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {budget.office?.client?.socialReason ?? "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {budget.office?.name ?? ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {budget.types?.map((t) => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{budget.currency}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {VAT_LABELS[budget.vat] ?? budget.vat}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {budget.showTotal
                          ? `${budget.currency === "USD" ? "U$D" : "$"} ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <BudgetStatusChip status={budget.status ?? "PENDING"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {budget.date ? format(new Date(budget.date), "dd/MM/yyyy") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/budgets/${budget._id}`)}
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
                      {budgets.length === 0
                        ? "No hay presupuestos registrados."
                        : "No se encontraron resultados para la búsqueda."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filtered.length > 0 && (
          <PaginationControls pagination={{ ...pagination, total: filtered.length }} />
        )}
      </Paper>
    </Box>
  );
};
