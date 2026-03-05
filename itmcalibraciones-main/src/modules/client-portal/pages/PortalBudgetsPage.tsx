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
import { FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePortalBudgets } from "../../budgets/hooks/useBudgets";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetStatus } from "../../budgets/types";

const STATUS_CONFIG: Record<BudgetStatus, { label: string; color: "default" | "warning" | "success" | "error" }> = {
  PENDING:  { label: "Pendiente de aprobación", color: "warning" },
  APPROVED: { label: "Aprobado",                color: "success" },
  REJECTED: { label: "Rechazado",               color: "error"   },
};

const formatDate = (d?: string) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd MMM yyyy", { locale: es }); } catch { return d; }
};

const formatCurrency = (details: { totalPrice: number }[], currency: string) => {
  const total = details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;
  const symbol = currency === "USD" ? "U$D" : "$";
  return `${symbol} ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
};

export const PortalBudgetsPage = () => {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = usePortalBudgets();

  const pending  = budgets.filter((b) => b.status === "PENDING").length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.3px">
          Mis Presupuestos
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {budgets.length} {budgets.length === 1 ? "presupuesto" : "presupuestos"}
          {pending > 0 && (
            <Box component="span" sx={{ ml: 1 }}>
              · <Box component="span" sx={{ color: "warning.main", fontWeight: 700 }}>{pending} pendiente{pending > 1 ? "s" : ""} de aprobación</Box>
            </Box>
          )}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : budgets.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", textAlign: "center", py: 10 }}>
          <Box sx={{ opacity: 0.15, mb: 2 }}><FileText size={52} /></Box>
          <Typography color="text.secondary">No hay presupuestos disponibles</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                  <TableCell>N° Presupuesto</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Servicios</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {budgets.map((budget) => {
                  const status = STATUS_CONFIG[budget.status] ?? { label: budget.status, color: "default" as const };
                  return (
                    <TableRow
                      key={budget._id}
                      hover
                      sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                      onClick={() => navigate(`/portal/budgets/${budget._id}`)}
                    >
                      <TableCell>
                        <Chip
                          label={budget.code ?? "—"}
                          size="small"
                          sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "action.selected", borderRadius: 1, height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {formatDate(budget.date)}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {budget.reference || "—"}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                          {budget.types?.map((t) => (
                            <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.72rem" }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem" }}>
                        {formatCurrency(budget.details, budget.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Ver presupuesto">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/portal/budgets/${budget._id}`)}>
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
        </Paper>
      )}
    </Box>
  );
};
