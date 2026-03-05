import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePortalBudgets, useClientApproveBudget, useClientRejectBudget } from "../../budgets/hooks/useBudgets";
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
  try { return format(new Date(d), "dd 'de' MMMM yyyy", { locale: es }); } catch { return d; }
};

export const PortalBudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = usePortalBudgets();
  const approveMutation = useClientApproveBudget();
  const rejectMutation  = useClientRejectBudget();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);

  const budget = budgets.find((b) => b._id === id);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!budget) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Presupuesto no encontrado</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/portal/budgets")} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  const status = STATUS_CONFIG[budget.status] ?? { label: budget.status, color: "default" as const };
  const isPending = budget.status === "PENDING";
  const currencySymbol = budget.currency === "USD" ? "U$D" : "$";
  const grandTotal = budget.details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;

  const handleApprove = () => {
    approveMutation.mutate(budget._id, {
      onSuccess: () => setApproveOpen(false),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id: budget._id, reason: rejectionReason || undefined },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setRejectionReason("");
        },
      },
    );
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Button
        startIcon={<ArrowLeft size={15} />}
        onClick={() => navigate("/portal/budgets")}
        size="small"
        sx={{ mb: 2.5, color: "text.secondary", textTransform: "none", fontWeight: 500, p: 0, minWidth: "auto", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
        disableRipple
      >
        Volver a Presupuestos
      </Button>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3,
          border: "1px solid", borderColor: "divider",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.50", color: "primary.main", display: "flex" }}>
                <FileText size={20} />
              </Box>
              <Typography variant="h4" fontWeight={800} fontFamily="monospace" letterSpacing="-0.5px">
                {budget.code ?? "—"}
              </Typography>
              <Chip label={status.label} color={status.color} size="medium" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Fecha: {formatDate(budget.date)}
              {budget.reference && <> &nbsp;·&nbsp; Ref: {budget.reference}</>}
            </Typography>
          </Box>

          {/* Action buttons — only when PENDING */}
          {isPending && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={16} />}
                onClick={() => setRejectOpen(true)}
                sx={{ fontWeight: 600 }}
              >
                Rechazar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={() => setApproveOpen(true)}
                sx={{ fontWeight: 600 }}
              >
                Aprobar presupuesto
              </Button>
            </Stack>
          )}
        </Box>

        {/* Mensaje del laboratorio */}
        {budget.notes && (
          <Alert severity="info" icon={false} sx={{ mt: 2, borderRadius: 2, bgcolor: "action.hover", color: "text.primary", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
              MENSAJE DEL LABORATORIO
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              {budget.notes}
            </Typography>
          </Alert>
        )}

        {/* Approved / Rejected feedback */}
        {budget.status === "APPROVED" && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
            Aprobaste este presupuesto. El laboratorio fue notificado y procederá con el trabajo.
            {budget.approvedBy && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.85 }}>
                Aprobado por <strong>{budget.approvedBy}</strong>
                {budget.approvedAt && <> · {format(new Date(budget.approvedAt), "dd/MM/yyyy HH:mm", { locale: es })}</>}
              </Typography>
            )}
          </Alert>
        )}
        {budget.status === "REJECTED" && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            Rechazaste este presupuesto.
            {budget.rejectionReason && <> Motivo: <strong>{budget.rejectionReason}</strong></>}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* ── Info Panel ──────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography fontWeight={700} variant="subtitle1" sx={{ mb: 2 }}>Condiciones</Typography>

            <Stack spacing={1.5}>
              {budget.attention && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>A la atención de</Typography>
                  <Typography variant="body2" fontWeight={500}>{budget.attention}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Forma de pago</Typography>
                <Typography variant="body2" fontWeight={500}>{budget.paymentTerms || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Validez de la oferta</Typography>
                <Typography variant="body2" fontWeight={500}>{budget.offerValidity} días</Typography>
              </Box>
              {budget.deliveryTime && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Plazo de entrega</Typography>
                  <Typography variant="body2" fontWeight={500}>{budget.deliveryTime}</Typography>
                </Box>
              )}
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Tipo de servicios</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {budget.types?.map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.78rem" }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* ── Items Table ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography fontWeight={700} variant="subtitle1">Detalle de servicios</Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main", "& th": { color: "white", fontWeight: 700, fontSize: "0.78rem" } }}>
                    <TableCell sx={{ width: "7%" }}>Cant.</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right" sx={{ width: "16%" }}>Precio unit.</TableCell>
                    <TableCell align="right" sx={{ width: "9%" }}>Dto.</TableCell>
                    <TableCell align="right" sx={{ width: "16%" }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budget.details?.map((d, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? "transparent" : "action.hover", "&:last-child td": { border: 0 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>{d.quantity}</TableCell>
                      <TableCell>{d.description}</TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                        {currencySymbol} {d.unitPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {d.discount ? `${d.discount}%` : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                        {currencySymbol} {d.totalPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {budget.showTotal && (
              <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "flex-end", borderTop: "2px solid", borderColor: "primary.main" }}>
                <Typography variant="h6" fontWeight={800} color="primary.main" fontFamily="monospace">
                  TOTAL: {currencySymbol} {grandTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}
          </Paper>

        </Grid>
      </Grid>

      {/* ── Approve Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Aprobar presupuesto</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Al aprobar, el laboratorio recibirá la confirmación y procederá con el trabajo.
            ¿Confirmás la aprobación del presupuesto <strong>{budget.code}</strong>?
          </Typography>
          {approveMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(approveMutation.error as any)?.response?.data?.message ?? "Error al aprobar"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setApproveOpen(false)} color="inherit" disabled={approveMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            startIcon={approveMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CheckCircle size={16} />}
          >
            {approveMutation.isPending ? "Aprobando..." : "Confirmar aprobación"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Rechazar presupuesto</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Si rechazás, el laboratorio no procederá con el trabajo adicional.
            El equipo puede ser devuelto sin calibrar.
          </Typography>
          <TextField
            label="Motivo del rechazo (opcional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            size="small"
            placeholder="Ej: No autorizo el gasto, devolver el equipo."
          />
          {rejectMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(rejectMutation.error as any)?.response?.data?.message ?? "Error al rechazar"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setRejectOpen(false)} color="inherit" disabled={rejectMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            startIcon={rejectMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <XCircle size={16} />}
          >
            {rejectMutation.isPending ? "Rechazando..." : "Confirmar rechazo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
