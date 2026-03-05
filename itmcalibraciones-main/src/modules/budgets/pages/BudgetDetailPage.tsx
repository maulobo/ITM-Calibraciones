import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import { ArrowLeft, Link2, Mail, X, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useBudget, useUpdateBudgetStatus, useSendBudget } from "../hooks/useBudgets";
import { BudgetStatusChip, STATUS_CONFIG } from "../components/BudgetStatusChip";
import type { BudgetStatus, BudgetType } from "../types";

const VAT_LABELS: Record<string, string> = {
  "21":     "21%",
  "10,5":   "10,5%",
  "NO_IVA": "IVA No Incluido",
  "EXEMPT": "IVA Exento",
};

const TYPE_COLORS: Record<BudgetType, "primary" | "secondary" | "info" | "warning"> = {
  "Calibración":  "primary",
  "Venta":        "secondary",
  "Alquiler":     "info",
  "Mantenimiento":"warning",
};

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budget, isLoading, error } = useBudget(id!);
  const updateStatus = useUpdateBudgetStatus();
  const sendBudget = useSendBudget();

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (error || !budget)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">No se pudo cargar el presupuesto.</Typography>
      </Box>
    );

  const code = budget.code ?? `${budget.year}-${String(budget.number).padStart(5, "0")}`;
  const total = budget.details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;
  const currencySymbol = budget.currency === "USD" ? "U$D" : "$";

  const handleStatusChange = (newStatus: BudgetStatus) => {
    updateStatus.mutate({ id: budget._id, status: newStatus });
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddRecipient = () => {
    const email = emailInput.trim();
    if (!isValidEmail(email)) {
      setEmailError("Email inválido");
      return;
    }
    if (recipients.includes(email)) {
      setEmailError("Ya está en la lista");
      return;
    }
    setRecipients([...recipients, email]);
    setEmailInput("");
    setEmailError("");
  };

  const handleSend = () => {
    if (recipients.length === 0) return;
    sendBudget.mutate(
      { id: budget._id, recipients },
      {
        onSuccess: () => {
          setSendSuccess(true);
          setTimeout(() => {
            setSendDialogOpen(false);
            setSendSuccess(false);
            setRecipients([]);
          }, 1500);
        },
      },
    );
  };

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setRecipients([]);
    setEmailInput("");
    setEmailError("");
    setSendSuccess(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <IconButton onClick={() => navigate("/budgets")}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h4" fontWeight="bold">
              Presupuesto {code}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {budget.types?.map((t) => (
                <Chip key={t} label={t} size="small" color={TYPE_COLORS[t] ?? "default"} />
              ))}
            </Box>
          </Box>
          <Typography color="text.secondary">
            {budget.date ? format(new Date(budget.date), "dd/MM/yyyy") : "—"}
            {budget.reference ? ` · ${budget.reference}` : ""}
          </Typography>
        </Box>

        {/* Botón enviar por email */}
        <Button
          variant="outlined"
          startIcon={<Mail size={16} />}
          onClick={() => setSendDialogOpen(true)}
        >
          Enviar por email
        </Button>

        {/* Cambio de estado inline */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Estado:</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={budget.status ?? "PENDING"}
              onChange={(e) => handleStatusChange(e.target.value as BudgetStatus)}
              disabled={updateStatus.isPending}
              renderValue={(val) => <BudgetStatusChip status={val as BudgetStatus} />}
              sx={{ "& .MuiSelect-select": { py: 0.5 } }}
            >
              {(Object.keys(STATUS_CONFIG) as BudgetStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  <BudgetStatusChip status={s} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {updateStatus.isPending && <CircularProgress size={16} />}
        </Box>
      </Box>

      {/* ── Datos del cliente ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Cliente</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Razón Social</Typography>
            <Typography fontWeight={500}>{budget.office?.client?.socialReason ?? "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">CUIT</Typography>
            <Typography fontWeight={500}>{budget.office?.client?.cuit ?? "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Sucursal</Typography>
            <Typography fontWeight={500}>{budget.office?.name ?? "—"}</Typography>
          </Grid>
          {budget.attention && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">A la atención de</Typography>
              <Typography fontWeight={500}>{budget.attention}</Typography>
            </Grid>
          )}
          {budget.advisor && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">Asesor</Typography>
              <Typography fontWeight={500}>
                {(budget.advisor as any).name} {(budget.advisor as any).lastName}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* ── Condiciones comerciales ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Condiciones comerciales</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Moneda</Typography>
            <Typography fontWeight={500}>{budget.currency}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">IVA</Typography>
            <Typography fontWeight={500}>{VAT_LABELS[budget.vat] ?? budget.vat}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Forma de pago</Typography>
            <Typography fontWeight={500}>{budget.paymentTerms ?? "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Validez oferta</Typography>
            <Typography fontWeight={500}>{budget.offerValidity} días</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Plazo de entrega</Typography>
            <Typography fontWeight={500}>{budget.deliveryTime ?? "—"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Ítems ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Ítems</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell sx={{ width: 70 }}>Cant.</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell sx={{ width: 160 }}>OT vinculada</TableCell>
                <TableCell align="right" sx={{ width: 130 }}>Precio unit.</TableCell>
                <TableCell align="right" sx={{ width: 90 }}>Dto. %</TableCell>
                <TableCell align="right" sx={{ width: 130 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budget.details?.map((item, i) => (
                <TableRow key={item._id ?? i}>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.description}</Typography>
                  </TableCell>
                  <TableCell>
                    {item.linkedOtCode ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Link2 size={13} color="gray" />
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => {
                            // navegar a la OT si tenemos el ID
                          }}
                        >
                          {item.linkedOtCode}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">Sin vincular</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {currencySymbol} {item.unitPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.discount > 0 ? `${item.discount}%` : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {currencySymbol} {item.totalPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {budget.showTotal && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="h6" fontWeight="bold">
                Total: {currencySymbol} {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* ── OT Vinculada (nivel budget) ── */}
      {budget.serviceOrder && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>Orden de Servicio vinculada</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Link2 size={16} />
            <Typography
              color="primary.main"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(`/service-orders/${budget.serviceOrder!._id}`)}
            >
              {budget.serviceOrder.code}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* ── Mensaje para el cliente ── */}
      {budget.notes && (
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "info.light", bgcolor: "info.50" }}>
          <Typography variant="subtitle1" fontWeight="bold" color="info.main" mb={1}>Mensaje para el cliente</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {budget.notes}
          </Typography>
        </Paper>
      )}

      {/* ── Notas ── */}
      {budget.selectedNotes?.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>Notas incluidas</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {budget.selectedNotes.map((note) => (
              <Chip key={note} label={note} size="small" variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}

      {/* ── Modal: Enviar por email ── */}
      <Dialog open={sendDialogOpen} onClose={handleCloseSendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar presupuesto por email</DialogTitle>
        <DialogContent>
          {sendSuccess ? (
            <Alert severity="success">¡Presupuesto enviado correctamente!</Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ingresá uno o más destinatarios. El presupuesto <strong>{code}</strong> será enviado a cada uno.
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email del destinatario"
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRecipient(); } }}
                  error={!!emailError}
                  helperText={emailError}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRecipient}
                  startIcon={<Plus size={16} />}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Agregar
                </Button>
              </Box>

              {recipients.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {recipients.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => setRecipients(recipients.filter((r) => r !== email))}
                      deleteIcon={<X size={14} />}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={sendBudget.isPending ? <CircularProgress size={14} /> : <Mail size={16} />}
            disabled={recipients.length === 0 || sendBudget.isPending || sendSuccess}
            onClick={handleSend}
          >
            {sendBudget.isPending ? "Enviando..." : `Enviar a ${recipients.length} destinatario${recipients.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
