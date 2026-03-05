import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { ArrowLeft, Plus, Trash2, Save, Link2, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useCreateBudget } from "../hooks/useBudgets";
import { useClients } from "../../clients/hooks/useClients";
import { useOfficesByClient } from "../../clients/hooks/useOffices";
import { useAuthStore } from "../../../store/useAuthStore";
import { LinkOtDialog } from "../components/LinkOtDialog";
import type { BudgetType, CurrencyType, VatType, CreateBudgetDTO } from "../types";

const BUDGET_TYPES: BudgetType[] = ["Calibración", "Venta", "Alquiler", "Mantenimiento"];

const VAT_OPTIONS: { value: VatType; label: string }[] = [
  { value: "NO_IVA", label: "IVA No Incluido" },
  { value: "21",     label: "21%" },
  { value: "10,5",   label: "10,5%" },
  { value: "EXEMPT", label: "Exento" },
];

// Notas predefinidas disponibles
const ALL_NOTES = [
  "Condiciones fiscales",
  "Facturación",
  "Validez de la oferta",
  "Garantía calibración",
  "Garantía venta",
  "Transporte",
  "Lugar de entrega",
  "Plazo de entrega",
  "Calibraciones autorizadas",
  "Nota de alquileres",
  "Venta mercadería nacionalizada",
  "Venta mercadería importada",
];

// Notas que se pre-seleccionan según el tipo elegido
const getDefaultNotes = (types: BudgetType[]): string[] => {
  const notes = new Set(["Condiciones fiscales", "Facturación", "Validez de la oferta"]);
  if (types.includes("Alquiler")) notes.add("Nota de alquileres");
  if (types.includes("Calibración") || types.includes("Mantenimiento")) {
    ["Garantía calibración", "Transporte", "Lugar de entrega", "Calibraciones autorizadas", "Plazo de entrega"].forEach((n) => notes.add(n));
  }
  if (types.includes("Venta")) {
    ["Garantía venta", "Transporte", "Lugar de entrega", "Plazo de entrega"].forEach((n) => notes.add(n));
  }
  return [...notes];
};

interface FormValues {
  types: BudgetType[];
  clientId: string;
  officeId: string;
  attention: string;
  date: string;
  reference: string;
  deliveryTime: string;
  offerValidity: number;
  paymentTerms: string;
  currency: CurrencyType;
  vat: VatType;
  showTotal: boolean;
  notes: string;
  selectedNotes: string[];
  details: {
    quantity: number;
    description: string;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    linkedOtCode?: string;
    linkedEquipmentId?: string;
  }[];
}

interface FromEquipmentState {
  clientId?: string;
  officeId?: string;
  equipmentId?: string;
  otCode?: string;
  description?: string;
}

export const CreateBudgetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { fromEquipment?: FromEquipmentState } | null)?.fromEquipment;
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateBudget();

  const { data: clientsResponse } = useClients();
  const clients = clientsResponse?.data ?? [];

  const prefillTypes: BudgetType[] = prefill ? ["Mantenimiento"] : [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      types: prefillTypes,
      clientId: prefill?.clientId ?? "",
      officeId: prefill?.officeId ?? "",
      attention: "",
      date: new Date().toISOString().slice(0, 10),
      reference: prefill?.otCode ? `OT ${prefill.otCode}` : "",
      deliveryTime: "",
      offerValidity: 10,
      paymentTerms: "",
      currency: "USD",
      vat: "NO_IVA",
      showTotal: true,
      notes: prefill?.otCode ? `Presupuesto correspondiente al equipo con OT ${prefill.otCode}. Motivo: ${prefill.description ?? "equipo frenado"}.` : "",
      selectedNotes: getDefaultNotes(prefillTypes),
      details: [{
        quantity: 1,
        description: prefill?.description ?? "",
        unitPrice: 0,
        discount: 0,
        totalPrice: 0,
        linkedOtCode: prefill?.otCode,
        linkedEquipmentId: prefill?.equipmentId,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "details" });

  const [linkDialogIndex, setLinkDialogIndex] = useState<number | null>(null);

  const selectedClientId = watch("clientId");
  const selectedTypes = watch("types");
  const details = watch("details");
  const currency = watch("currency");
  const showTotal = watch("showTotal");
  const selectedNotes = watch("selectedNotes");

  const { data: offices = [], isLoading: loadingOffices } = useOfficesByClient(selectedClientId);

  // Auto-seleccionar notas cuando cambian los tipos
  const handleTypeToggle = (type: BudgetType, checked: boolean) => {
    const current = watch("types");
    const next = checked ? [...current, type] : current.filter((t) => t !== type);
    setValue("types", next);
    setValue("selectedNotes", getDefaultNotes(next));
  };

  // Calcular totalPrice de un ítem
  const calcItemTotal = (qty: number, price: number, discount: number) => {
    const subtotal = qty * price;
    return subtotal - (subtotal * discount) / 100;
  };

  const grandTotal = useMemo(
    () => details.reduce((acc, d) => acc + (d.totalPrice || 0), 0),
    [details],
  );

  const onSubmit = (values: FormValues) => {
    if (!values.officeId) return;

    const dto: CreateBudgetDTO = {
      types: values.types,
      office: values.officeId,
      advisor: user?.id,
      attention: values.attention || undefined,
      date: values.date,
      reference: values.reference || undefined,
      deliveryTime: values.deliveryTime || undefined,
      offerValidity: values.offerValidity,
      paymentTerms: values.paymentTerms,
      currency: values.currency,
      vat: values.vat,
      showTotal: values.showTotal,
      notes: values.notes || undefined,
      selectedNotes: values.selectedNotes,
      details: values.details.map((d) => ({
        quantity: d.quantity,
        description: d.description,
        unitPrice: d.unitPrice,
        discount: d.discount,
        totalPrice: d.totalPrice,
        linkedOtCode: d.linkedOtCode || undefined,
        linkedEquipmentId: d.linkedEquipmentId || undefined,
      })),
    };

    createMutation.mutate(dto, {
      onSuccess: () => navigate("/budgets"),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate("/budgets")}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">Nuevo Presupuesto</Typography>
          <Typography color="text.secondary">Completá los datos para generar la cotización</Typography>
        </Box>
      </Box>

      {prefill && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Link2 size={18} />}>
          Presupuesto pre-cargado desde equipo frenado
          {prefill.otCode && <> · OT <strong>{prefill.otCode}</strong></>}.
          Revisá los datos antes de guardar.
        </Alert>
      )}

      {createMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al crear el presupuesto. Revisá los datos e intentá de nuevo.
        </Alert>
      )}

      {/* ── Sección 1: Datos generales ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Datos generales</Typography>
        <Grid container spacing={2}>
          {/* Tipo */}
          <Grid size={{ xs: 12 }}>
            <FormControl component="fieldset">
              <FormLabel>Tipo de presupuesto *</FormLabel>
              <FormGroup row>
                {BUDGET_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => handleTypeToggle(type, e.target.checked)}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
              {selectedTypes.length === 0 && (
                <Typography variant="caption" color="error">
                  Seleccioná al menos un tipo
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Cliente */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="clientId"
              control={control}
              rules={{ required: "El cliente es obligatorio" }}
              render={({ field }) => (
                <Autocomplete
                  options={clients}
                  getOptionLabel={(o) => o.socialReason}
                  value={clients.find((c) => c.id === field.value) ?? null}
                  onChange={(_, val) => {
                    field.onChange(val?.id ?? "");
                    setValue("officeId", "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente *"
                      error={!!errors.clientId}
                      helperText={errors.clientId?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* Sucursal */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="officeId"
              control={control}
              rules={{ required: "La sucursal es obligatoria" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.officeId}>
                  <InputLabel>Sucursal *</InputLabel>
                  <Select {...field} label="Sucursal *" disabled={!selectedClientId || loadingOffices}>
                    {offices.map((o: any) => (
                      <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.officeId && (
                    <Typography variant="caption" color="error">{errors.officeId.message}</Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* A la atención de */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="attention"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="A la atención de" />
              )}
            />
          </Grid>

          {/* Referencia */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Referencia" />
              )}
            />
          </Grid>

          {/* Fecha */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="date"
              control={control}
              rules={{ required: "La fecha es obligatoria" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Fecha *"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />
          </Grid>
          {/* Mensaje para el cliente */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mensaje para el cliente"
                  placeholder="Ej: Este presupuesto corresponde al mantenimiento necesario para continuar con la calibración del equipo..."
                  multiline
                  minRows={2}
                  maxRows={5}
                  helperText="Este texto aparece visible para el cliente en el portal y en el email."
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Sección 2: Condiciones comerciales ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Condiciones comerciales</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Moneda</InputLabel>
                  <Select {...field} label="Moneda">
                    <MenuItem value="USD">USD (Dólares)</MenuItem>
                    <MenuItem value="ARS">ARS (Pesos)</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name="vat"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>IVA</InputLabel>
                  <Select {...field} label="IVA">
                    {VAT_OPTIONS.map((v) => (
                      <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name="offerValidity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Validez oferta (días)"
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name="deliveryTime"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Plazo de entrega" placeholder="Ej: 7 días hábiles" />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="paymentTerms"
              control={control}
              rules={{ required: "La forma de pago es obligatoria" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Forma de pago *"
                  placeholder="Ej: 30 días F.F."
                  error={!!errors.paymentTerms}
                  helperText={errors.paymentTerms?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="showTotal"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Mostrar total en presupuesto"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Sección 3: Ítems ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Ítems</Typography>
          <Button
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => append({ quantity: 1, description: "", unitPrice: 0, discount: 0, totalPrice: 0 })}
          >
            Agregar ítem
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell sx={{ width: 90, minWidth: 90 }}>Cant.</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell sx={{ width: 160, minWidth: 130 }}>ST para enlazar</TableCell>
                <TableCell align="right" sx={{ width: 130, minWidth: 130 }}>Precio unit.</TableCell>
                <TableCell align="right" sx={{ width: 90, minWidth: 90 }}>Dto. %</TableCell>
                <TableCell align="right" sx={{ width: 130, minWidth: 130 }}>Total</TableCell>
                <TableCell sx={{ width: 48, minWidth: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Controller
                      name={`details.${index}.quantity`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="number"
                          size="small"
                          sx={{ width: 70 }}
                          inputProps={{ min: 1 }}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            f.onChange(qty);
                            const price = watch(`details.${index}.unitPrice`);
                            const disc = watch(`details.${index}.discount`);
                            setValue(`details.${index}.totalPrice`, calcItemTotal(qty, price, disc));
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`details.${index}.description`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} size="small" fullWidth multiline maxRows={3} />
                      )}
                    />
                  </TableCell>
                  {/* Columna ST para enlazar */}
                  <TableCell>
                    {watch(`details.${index}.linkedOtCode`) ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Link2 size={13} color="gray" />
                        <Typography variant="caption" color="primary.main" sx={{ flexGrow: 1 }}>
                          {watch(`details.${index}.linkedOtCode`)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setValue(`details.${index}.linkedOtCode`, undefined);
                            setValue(`details.${index}.linkedEquipmentId`, undefined);
                          }}
                        >
                          <X size={12} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="text"
                        sx={{ fontSize: 11, color: "text.secondary", textTransform: "none", p: 0.5 }}
                        onClick={() => setLinkDialogIndex(index)}
                      >
                        + Vincular OT
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`details.${index}.unitPrice`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="number"
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          onChange={(e) => {
                            const price = Number(e.target.value);
                            f.onChange(price);
                            const qty = watch(`details.${index}.quantity`);
                            const disc = watch(`details.${index}.discount`);
                            setValue(`details.${index}.totalPrice`, calcItemTotal(qty, price, disc));
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`details.${index}.discount`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="number"
                          size="small"
                          inputProps={{ min: 0, max: 100 }}
                          onChange={(e) => {
                            const disc = Number(e.target.value);
                            f.onChange(disc);
                            const qty = watch(`details.${index}.quantity`);
                            const price = watch(`details.${index}.unitPrice`);
                            setValue(`details.${index}.totalPrice`, calcItemTotal(qty, price, disc));
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {currency === "USD" ? "U$D" : "$"}{" "}
                      {(watch(`details.${index}.totalPrice`) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {showTotal && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pr: 6 }}>
            <Typography variant="h6" fontWeight="bold">
              Total: {currency === "USD" ? "U$D" : "$"}{" "}
              {grandTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ── Sección 4: Notas ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Notas del presupuesto
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Se pre-seleccionan según el tipo elegido. Podés ajustarlas.
        </Typography>
        <Controller
          name="selectedNotes"
          control={control}
          render={({ field }) => (
            <FormGroup row>
              {ALL_NOTES.map((note) => (
                <FormControlLabel
                  key={note}
                  control={
                    <Checkbox
                      checked={field.value.includes(note)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...field.value, note]
                          : field.value.filter((n) => n !== note);
                        field.onChange(next);
                      }}
                    />
                  }
                  label={note}
                  sx={{ width: { xs: "100%", sm: "50%", md: "33%" } }}
                />
              ))}
            </FormGroup>
          )}
        />
      </Paper>

      {/* ── Acciones ── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/budgets")}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={createMutation.isPending ? <CircularProgress size={16} /> : <Save size={18} />}
          disabled={createMutation.isPending || selectedTypes.length === 0}
        >
          {createMutation.isPending ? "Guardando..." : "Guardar presupuesto"}
        </Button>
      </Box>

      {/* ── Dialog vinculación OT ── */}
      <LinkOtDialog
        open={linkDialogIndex !== null}
        onClose={() => setLinkDialogIndex(null)}
        onSelect={(otCode, equipmentId) => {
          if (linkDialogIndex === null) return;
          setValue(`details.${linkDialogIndex}.linkedOtCode`, otCode);
          setValue(`details.${linkDialogIndex}.linkedEquipmentId`, equipmentId);
          setLinkDialogIndex(null);
        }}
      />
    </Box>
  );
};
