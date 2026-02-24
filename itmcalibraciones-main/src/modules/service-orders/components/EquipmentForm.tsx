import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Divider,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Stack,
  Alert,
} from "@mui/material";
import { Search, Plus, ArrowLeft, CheckCircle, HelpCircle, PackagePlus, AlertTriangle, Lock, Tag } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  useBrands,
  useEquipmentTypes,
  useModels,
} from "../../catalog/hooks/useCatalog";
import { useEquipments } from "../../equipments/hooks/useEquipments";
import { QuickModelCreateModal } from "./QuickModelCreateModal";
import type { EquipmentType } from "../../catalog/types";
import type { Equipment } from "../../equipments/types";
import type { ServiceOrderItem } from "../types";

// Estados logísticos que indican que el equipo está ocupado en otra orden
const ACTIVE_LOGISTIC_STATES = ["RECEIVED", "IN_LABORATORY", "EXTERNAL", "ON_HOLD", "READY_TO_DELIVER"];
const LOGISTIC_STATE_LABELS: Record<string, string> = {
  RECEIVED:         "Recibido",
  IN_LABORATORY:    "En Laboratorio",
  EXTERNAL:         "En Externo",
  ON_HOLD:          "En Espera",
  READY_TO_DELIVER: "Listo para Retiro",
  DELIVERED:        "Entregado",
};

interface EquipmentFormProps {
  onAdd: (item: ServiceOrderItem) => void;
  clientId?: string;
  existingItems?: ServiceOrderItem[];
}

type Mode = "search" | "create";

export const EquipmentForm = ({ onAdd, clientId, existingItems = [] }: EquipmentFormProps) => {
  const [serialSearch, setSerialSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [mode, setMode] = useState<Mode>("search");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchObservations, setSearchObservations] = useState("");

  const { data: searchResults = [], isLoading: isSearching } = useEquipments(
    serialSearch.length >= 2 ? serialSearch : undefined,
    clientId,
    tagSearch.length >= 1 ? tagSearch : undefined,
  );

  const { data: typesResponse } = useEquipmentTypes();
  const allTypes = typesResponse?.data || [];
  const { data: brandsResponse } = useBrands();
  const brands = brandsResponse?.data || [];

  const { data: modelsResponse, refetch: refetchModels } = useModels({
    brand: selectedBrand || undefined,
  });
  const allBrandModels = modelsResponse?.data || [];

  const availableTypes = useMemo((): EquipmentType[] => {
    if (!selectedBrand) return allTypes;
    const typeMap = new Map<string, EquipmentType>();
    allBrandModels.forEach((m) => {
      const et = m.equipmentType;
      if (et && typeof et === "object") {
        typeMap.set((et as EquipmentType)._id, et as EquipmentType);
      }
    });
    return Array.from(typeMap.values());
  }, [selectedBrand, allBrandModels, allTypes]);

  const models = useMemo(() => {
    if (!selectedType) return allBrandModels;
    return allBrandModels.filter((m) => {
      const et = m.equipmentType;
      if (typeof et === "object") return (et as EquipmentType)._id === selectedType;
      return et === selectedType;
    });
  }, [allBrandModels, selectedType]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceOrderItem>({
    defaultValues: { model: "", serialNumber: "", range: "", tag: "", observations: "" },
  });

  const watchedSerial = watch("serialNumber");
  const watchedTag    = watch("tag");

  // Check if serial already exists in DB for this client (only in create mode)
  const { data: dbSerialMatches = [] } = useEquipments(
    mode === "create" && watchedSerial && watchedSerial.length >= 2 ? watchedSerial : undefined,
    clientId,
  );
  const serialExistsInDb = dbSerialMatches.some(
    (eq) => eq.serialNumber.toLowerCase() === watchedSerial?.toLowerCase(),
  );

  // Duplicate checks within the current order
  const serialAlreadyInOrder = (serial: string) =>
    existingItems.some((i) => i.serialNumber.toLowerCase() === serial.toLowerCase());

  const tagAlreadyInOrder = (tag: string) =>
    !!tag && existingItems.some((i) => i.tag && i.tag.toLowerCase() === tag.toLowerCase());

  const handleSelectExisting = (eq: Equipment) => {
    if (serialAlreadyInOrder(eq.serialNumber)) return; // button is disabled anyway
    onAdd({
      model: (eq.model as any)?._id ?? (eq.model as any),
      serialNumber: eq.serialNumber,
      range: eq.range || "",
      tag: eq.tag || "",
      observations: searchObservations || undefined,
      _tempId: crypto.randomUUID(),
      _modelData: eq.model as any,
    });
    setSerialSearch("");
    setTagSearch("");
    setSearchObservations("");
  };

  const onSubmit = (data: ServiceOrderItem) => {
    // Block if serial is already in the order
    if (serialAlreadyInOrder(data.serialNumber)) return;
    const modelObj = models?.find((m) => m._id === data.model);
    onAdd({
      ...data,
      serialNumber: data.serialNumber || serialSearch,
      _tempId: crypto.randomUUID(),
      _modelData: modelObj,
    });
    reset({ serialNumber: "", range: "", tag: "", model: "", observations: "" });
    setSerialSearch("");
    setTagSearch("");
    setSearchObservations("");
    setSelectedBrand("");
    setSelectedType("");
    setMode("search");
  };

  const handleQuickCreateSuccess = (newModelId: string) => {
    refetchModels().then(() => setValue("model", newModelId));
  };

  const enterCreateMode = () => {
    reset({ model: "", serialNumber: serialSearch, range: "", tag: tagSearch || "", observations: searchObservations || "" });
    setMode("create");
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}
    >
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Agregar Equipo
      </Typography>

      {/* ── BUSCAR ── */}
      {mode === "search" && (
        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por número de serie"
              value={serialSearch}
              onChange={(e) => { setSerialSearch(e.target.value); setTagSearch(""); }}
              placeholder="Ej: SN-2024-001"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching && !tagSearch ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Search size={16} color="gray" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Buscar por tag"
              value={tagSearch}
              onChange={(e) => { setTagSearch(e.target.value); setSerialSearch(""); }}
              placeholder="Ej: TAG-001"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching && !serialSearch ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Tag size={16} color="gray" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {(serialSearch.length >= 2 || tagSearch.length >= 1) && (
            <Box>
              {isSearching ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, gap: 1.5 }}>
                  <CircularProgress size={22} />
                  <Typography variant="body2" color="text.secondary">Buscando...</Typography>
                </Box>
              ) : searchResults.length > 0 ? (
                /* ── Resultados encontrados ── */
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {searchResults.length} equipo{searchResults.length > 1 ? "s" : ""} encontrado{searchResults.length > 1 ? "s" : ""}
                  </Typography>
                  {searchResults.map((eq) => {
                    const alreadyAdded = serialAlreadyInOrder(eq.serialNumber);
                    const isActive = !alreadyAdded && !!eq.logisticState && ACTIVE_LOGISTIC_STATES.includes(eq.logisticState);
                    const isBlocked = alreadyAdded || isActive;
                    return (
                      <Paper
                        key={eq._id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          borderColor: alreadyAdded ? "grey.400" : isActive ? "warning.light" : "success.light",
                          bgcolor: alreadyAdded ? "grey.100" : isActive ? "warning.50" : "success.50",
                          opacity: isBlocked ? 0.85 : 1,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {eq.serialNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {eq.model?.name} &bull;{" "}
                              {(eq.model?.brand as any)?.name} &bull;{" "}
                              {(eq.model?.equipmentType as any)?.type}
                            </Typography>
                            {alreadyAdded ? (
                              <Chip label="Ya en esta orden" size="small" color="default" sx={{ mt: 0.5, height: 20, fontSize: 10 }} />
                            ) : isActive ? (
                              <Chip
                                icon={<Lock size={10} />}
                                label={`${LOGISTIC_STATE_LABELS[eq.logisticState!] ?? eq.logisticState}${eq.otCode ? ` · ${eq.otCode}` : ""}`}
                                size="small"
                                color="warning"
                                sx={{ mt: 0.5, height: 20, fontSize: 10 }}
                              />
                            ) : eq.serviceHistory && eq.serviceHistory.length > 0 ? (
                              <Chip
                                label={`${eq.serviceHistory.length} servicio${eq.serviceHistory.length > 1 ? "s" : ""} previo${eq.serviceHistory.length > 1 ? "s" : ""}`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ mt: 0.5, height: 20, fontSize: 10 }}
                              />
                            ) : null}
                          </Box>
                          <Tooltip
                            title={isActive ? `Este equipo ya tiene una orden activa (${eq.otCode ?? "en proceso"}). Debe ser entregado al cliente antes de crear una nueva orden.` : ""}
                            arrow
                          >
                            <span>
                              <Button
                                size="small"
                                variant={isBlocked ? "outlined" : "contained"}
                                color={isBlocked ? "inherit" : "success"}
                                startIcon={isActive ? <Lock size={14} /> : <CheckCircle size={14} />}
                                onClick={() => !isBlocked && handleSelectExisting(eq)}
                                disabled={isBlocked}
                                sx={{ flexShrink: 0 }}
                              >
                                {alreadyAdded ? "Agregado" : isActive ? "En curso" : "Agregar"}
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                        {isActive && (
                          <Alert
                            severity="warning"
                            icon={<Lock size={14} />}
                            sx={{ mt: 1, py: 0.25, fontSize: "0.75rem", borderRadius: 1.5 }}
                          >
                            Este equipo ya está activo en otra orden de servicio. Primero debe entregarse al cliente.
                          </Alert>
                        )}
                      </Paper>
                    );
                  })}

                  {/* Observaciones: solo cuando hay resultados para seleccionar */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Observaciones de ingreso"
                    placeholder="Ej: pantalla rota, cable desgastado..."
                    multiline
                    minRows={2}
                    value={searchObservations}
                    onChange={(e) => setSearchObservations(e.target.value)}
                    helperText="Opcional — anotá el estado del equipo al ingresar"
                  />

                  <Divider sx={{ my: 1 }}>
                    <Chip label="o ingresar uno nuevo" size="small" />
                  </Divider>
                </Stack>
              ) : (
                /* ── No encontrado ── */
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: "primary.light",
                    borderStyle: "dashed",
                    bgcolor: "primary.50",
                    textAlign: "center",
                  }}
                >
                  <PackagePlus size={28} color="#1976d2" style={{ marginBottom: 8 }} />
                  {serialSearch ? (
                    <>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Primer ingreso de <em>"{serialSearch}"</em>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                        Este equipo no está registrado aún para este cliente.
                        Completá los datos para registrarlo.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={enterCreateMode}
                        sx={{ borderRadius: 2 }}
                      >
                        Registrar "{serialSearch}" como nuevo equipo
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Ningún equipo con tag <em>"{tagSearch}"</em>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Probá buscar por número de serie o registrá el equipo como nuevo.
                      </Typography>
                    </>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {/* Botón genérico solo cuando no se ha buscado nada */}
          {serialSearch.length < 2 && tagSearch.length < 1 && (
            <Button
              variant="outlined"
              startIcon={<PackagePlus size={16} />}
              fullWidth
              onClick={enterCreateMode}
              sx={{ borderRadius: 2, borderStyle: "dashed", py: 1.2 }}
            >
              Ingresar equipo nuevo (sin buscar)
            </Button>
          )}
        </Stack>
      )}

      {/* ── CREAR NUEVO ── */}
      {mode === "create" && (
        <>
          {/* Header con contexto */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => setMode("search")}
              sx={{ color: "text.secondary", px: 0.5 }}
            >
              Volver
            </Button>
            {serialSearch && (
              <>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Chip
                  label={`Serie: ${serialSearch}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ height: 22, fontSize: 11 }}
                />
              </>
            )}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>

              {/* SECCIÓN 1: Identificación del modelo */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1, letterSpacing: 0.5, textTransform: "uppercase" }}
                >
                  Identificación del modelo
                </Typography>
                <Stack spacing={1.5}>
                  {/* Marca + Tipo en la misma fila */}
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Marca</InputLabel>
                      <Select
                        value={selectedBrand}
                        label="Marca"
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedType("");
                          setValue("model", "");
                        }}
                      >
                        <MenuItem value=""><em>Sin filtro</em></MenuItem>
                        {brands.map((b) => (
                          <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!!selectedBrand && availableTypes.length === 0}
                    >
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={selectedType}
                        label="Tipo"
                        onChange={(e) => {
                          setSelectedType(e.target.value);
                          setValue("model", "");
                        }}
                      >
                        <MenuItem value=""><em>Sin filtro</em></MenuItem>
                        {availableTypes.map((t) => (
                          <MenuItem key={t._id} value={t._id}>{t.type}</MenuItem>
                        ))}
                      </Select>
                      {selectedBrand && availableTypes.length === 0 && (
                        <FormHelperText>Sin tipos para esta marca</FormHelperText>
                      )}
                    </FormControl>
                  </Box>

                  {/* Modelo — fila completa */}
                  <Controller
                    name="model"
                    control={control}
                    rules={{ required: "Seleccioná un modelo" }}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.model}>
                        <InputLabel>Modelo *</InputLabel>
                        <Select
                          {...field}
                          label="Modelo *"
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" disabled>Seleccione un modelo…</MenuItem>
                          {models.map((m) => (
                            <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                          ))}
                          <Divider />
                          <MenuItem
                            value="new"
                            onClick={() => setIsQuickCreateOpen(true)}
                            sx={{ fontWeight: "bold", color: "primary.main" }}
                          >
                            <Plus size={15} style={{ marginRight: 6 }} />
                            Crear nuevo modelo
                          </MenuItem>
                        </Select>
                        <FormHelperText>
                          {errors.model?.message ||
                            (models.length > 0
                              ? `${models.length} modelo${models.length > 1 ? "s" : ""} disponible${models.length > 1 ? "s" : ""}`
                              : selectedBrand
                              ? "Sin modelos para los filtros aplicados"
                              : "Seleccioná marca y/o tipo para filtrar")}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* SECCIÓN 2: Datos del ejemplar */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1, letterSpacing: 0.5, textTransform: "uppercase" }}
                >
                  Datos del ejemplar
                </Typography>
                <Stack spacing={1.5}>
                  {(() => {
                    const inOrder   = watchedSerial?.length > 0 && serialAlreadyInOrder(watchedSerial);
                    const inDb      = !inOrder && serialExistsInDb;
                    const dbMatch   = inDb ? dbSerialMatches.find(
                      (eq) => eq.serialNumber.toLowerCase() === watchedSerial?.toLowerCase(),
                    ) : null;
                    return (
                      <>
                        <TextField
                          {...register("serialNumber", { required: "Serie requerida" })}
                          label="Número de Serie *"
                          fullWidth
                          size="small"
                          error={!!errors.serialNumber || inOrder}
                          color={inDb ? "warning" : undefined}
                          focused={inDb || undefined}
                          helperText={
                            errors.serialNumber?.message
                              ? errors.serialNumber.message
                              : inOrder
                              ? "Este número de serie ya fue agregado a esta orden"
                              : inDb
                              ? `Ya existe en el inventario de este cliente (${dbMatch?.model?.name ?? "modelo desconocido"}) — usá el modo búsqueda`
                              : "Identificador único del fabricante"
                          }
                        />
                        {inDb && (
                          <Alert
                            severity="warning"
                            icon={<AlertTriangle size={16} />}
                            sx={{ py: 0.5, borderRadius: 2 }}
                            action={
                              <Button
                                size="small"
                                color="warning"
                                onClick={() => {
                                  setSerialSearch(watchedSerial ?? "");
                                  setMode("search");
                                }}
                              >
                                Ir a búsqueda
                              </Button>
                            }
                          >
                            <strong>{watchedSerial}</strong> ya existe — agregalo desde el modo búsqueda para mantener el historial.
                          </Alert>
                        )}
                      </>
                    );
                  })()}

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <TextField
                      {...register("range")}
                      label="Rango de medición"
                      placeholder="Ej: 0-600V AC"
                      fullWidth
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title="Capacidad de medición del instrumento. Ej: '0-600V AC', '-20°C a 200°C', '0-500 kg'."
                              arrow
                              placement="top"
                            >
                              <IconButton size="small" tabIndex={-1} sx={{ p: 0.3 }}>
                                <HelpCircle size={13} color="#9e9e9e" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      {...register("tag")}
                      label="Tag del cliente"
                      placeholder="Ej: TAG-001"
                      fullWidth
                      size="small"
                      error={tagAlreadyInOrder(watchedTag ?? "")}
                      helperText={
                        tagAlreadyInOrder(watchedTag ?? "")
                          ? "Este tag ya fue asignado a otro equipo en esta orden"
                          : undefined
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title="Código interno del cliente para este equipo. Distinto al número de serie. Ej: 'INS-025', 'MUL-003'."
                              arrow
                              placement="top"
                            >
                              <IconButton size="small" tabIndex={-1} sx={{ p: 0.3 }}>
                                <HelpCircle size={13} color="#9e9e9e" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <TextField
                    {...register("observations")}
                    label="Observaciones de ingreso"
                    placeholder="Ej: pantalla rota, cable desgastado..."
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    helperText="Opcional — se guardará en el historial del equipo"
                  />
                </Stack>
              </Box>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Plus size={18} />}
                fullWidth
                size="large"
                disabled={
                  serialAlreadyInOrder(watchedSerial ?? "") ||
                  tagAlreadyInOrder(watchedTag ?? "")
                }
                sx={{ borderRadius: 2, mt: 0.5 }}
              >
                Agregar a la lista
              </Button>
            </Stack>
          </form>

          <QuickModelCreateModal
            open={isQuickCreateOpen}
            onClose={() => setIsQuickCreateOpen(false)}
            onSuccess={handleQuickCreateSuccess}
            preSelectedBrand={selectedBrand}
            preSelectedType={selectedType}
          />
        </>
      )}
    </Paper>
  );
};
