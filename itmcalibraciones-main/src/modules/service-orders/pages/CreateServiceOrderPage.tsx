import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  User,
  UserPlus,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateServiceOrder } from "../hooks/useServiceOrders";
import { EquipmentForm } from "../components/EquipmentForm";
import { useClients } from "../../clients/hooks/useClients";
import { useOfficesByClient } from "../../clients/hooks/useOffices";
import { useClientUsers } from "../../clients/hooks/useClientUsers";
import { useCreateContactMutation } from "../../clients/hooks/useContacts";
import type {
  Contact,
  CreateServiceOrderDTO,
  ServiceOrderItem,
} from "../types";

const steps = ["Cliente y Contacto", "Carga de Equipos", "Confirmación"];

export const CreateServiceOrderPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState<ServiceOrderItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [pickContactId, setPickContactId] = useState<string>("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const createMutation = useCreateServiceOrder();
  const createContactMutation = useCreateContactMutation();

  // Data Fetching
  const { data: clientsResponse } = useClients();
  const clients = clientsResponse?.data || [];

  const { data: offices = [], isLoading: isLoadingOffices } =
    useOfficesByClient(selectedClient);

  const {
    control,
    formState: { errors },
    trigger,
    getValues,
    watch,
    setValue,
  } = useForm<CreateServiceOrderDTO>({
    defaultValues: {
      office: "",
      contacts: [],
      items: [],
    },
  });

  const selectedOffice = watch("office");
  const clientData = clients?.find(
    (c) => c._id === selectedClient || c.id === selectedClient,
  );

  // Cargar TODOS los usuarios del cliente y filtrar por oficina client-side
  // (mismo approach que OfficeDetailsPage para garantizar resultados)
  const { data: allClientUsers = [], isLoading: isLoadingContacts } =
    useClientUsers(selectedClient || undefined);

  const officeContacts = useMemo(() => {
    if (!selectedOffice) return [];
    return allClientUsers.filter((user) => {
      const userOfficeId =
        typeof user.office === "object" && user.office !== null
          ? (user.office as any)._id || (user.office as any).id
          : user.office;
      return userOfficeId === selectedOffice;
    });
  }, [allClientUsers, selectedOffice]);

  // Limpiar contactos y selector cuando cambia la oficina
  useEffect(() => {
    setSelectedContacts([]);
    setPickContactId("");
    setShowAddContact(false);
  }, [selectedOffice]);

  const handleAddContact = (userId: string) => {
    const user = officeContacts.find((u) => (u.id || u._id) === userId);
    if (!user) return;
    const alreadyAdded = selectedContacts.some(
      (c) =>
        c.name === `${user.name} ${user.lastName}`.trim() &&
        c.email === (user.email || ""),
    );
    if (alreadyAdded) return;
    setSelectedContacts([
      ...selectedContacts,
      {
        name: `${user.name} ${user.lastName}`.trim(),
        email: user.email || "",
        phone: user.phoneNumber || "",
        role: user.roles?.[0] || "",
      },
    ]);
    setPickContactId("");
  };

  const handleRemoveContact = (idx: number) => {
    setSelectedContacts(selectedContacts.filter((_, i) => i !== idx));
  };

  const handleAddNewContact = () => {
    if (!newContact.name || !newContact.email) return;
    if (!selectedClient || !selectedOffice) return;

    createContactMutation.mutate(
      {
        name: newContact.name,
        lastName: newContact.lastName,
        email: newContact.email,
        phoneNumber: newContact.phoneNumber,
        roles: ["USER"],
        client: selectedClient,
        office: selectedOffice,
      },
      {
        onSuccess: (created) => {
          setSelectedContacts([
            ...selectedContacts,
            {
              name: `${created.name} ${created.lastName}`.trim(),
              email: created.email || "",
              phone: created.phoneNumber || "",
              role: created.roles?.[0] || "",
            },
          ]);
          setShowAddContact(false);
          setNewContact({ name: "", lastName: "", email: "", phoneNumber: "" });
        },
      },
    );
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedClient) return;
      const isValid = await trigger(["office"]);
      if (!isValid) return;
      if (selectedContacts.length === 0) return;
    } else if (activeStep === 1) {
      if (items.length === 0) return;
    }

    if (activeStep === steps.length - 1) {
      onSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = () => {
    const formData = getValues();
    const payload: CreateServiceOrderDTO = {
      client: selectedClient,
      office: formData.office,
      contacts: selectedContacts,
      observations: formData.observations,
      estimatedDeliveryDate: formData.estimatedDeliveryDate,
      items: items.map((i) => ({
        model: i.model,
        serialNumber: i.serialNumber,
        range: i.range,
        tag: i.tag,
        observations: i.observations,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        navigate(`/service-orders/${data._id || data.id}`);
      },
      onError: () => {
        // error is shown via createMutation.error below
      },
    });
  };

  const addItem = (item: ServiceOrderItem) => setItems([...items, item]);
  const removeItem = (tempId?: string) => {
    if (!tempId) return;
    setItems(items.filter((i) => i._tempId !== tempId));
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/service-orders")}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Nueva Orden de Servicio
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
        {/* ── PASO 1: Cliente, Oficina y Contacto ── */}
        <Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Selección de Cliente y Oficina
          </Typography>

          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Autocomplete
                  options={clients || []}
                  value={clients?.find(c => (c._id || c.id) === selectedClient) ?? null}
                  getOptionLabel={(option) => option.socialReason || ""}
                  isOptionEqualToValue={(option, value) =>
                    (option._id || option.id) === (value._id || value.id)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Cliente" />
                  )}
                  onChange={(_, value) => {
                    const clientId = value?._id || value?.id || "";
                    setSelectedClient(clientId);
                    setValue("office", "");
                  }}
                />
              </FormControl>
            </Grid>

            {/* Oficina */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="office"
                control={control}
                rules={{ required: "Oficina requerida" }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.office}
                    disabled={!selectedClient || isLoadingOffices}
                  >
                    <InputLabel>
                      {isLoadingOffices ? "Cargando oficinas..." : "Oficina"}
                    </InputLabel>
                    <Select {...field} label="Oficina">
                      {!offices || offices.length === 0 ? (
                        <MenuItem disabled value="">
                          {selectedClient
                            ? "No hay oficinas para este cliente"
                            : "Seleccione un cliente primero"}
                        </MenuItem>
                      ) : (
                        offices.map((office) => (
                          <MenuItem
                            key={office._id || office.id}
                            value={office._id || office.id}
                          >
                            {office.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>{errors.office?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* ── Sección Contactos ── */}
          {selectedOffice && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>
                ¿Quién(es) traen los equipos?
              </Typography>

              {isLoadingContacts ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}
                >
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando contactos de la oficina...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Picker: elegir un contacto existente de la oficina */}
                  {officeContacts.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Buscar contacto de la oficina</InputLabel>
                          <Select
                            value={pickContactId}
                            onChange={(e) => setPickContactId(e.target.value)}
                            label="Buscar contacto de la oficina"
                          >
                            {officeContacts
                              .filter((u) => {
                                const fullName =
                                  `${u.name} ${u.lastName}`.trim();
                                const email = u.email || "";
                                return !selectedContacts.some(
                                  (c) =>
                                    c.name === fullName && c.email === email,
                                );
                              })
                              .map((user) => (
                                <MenuItem
                                  key={user.id || user._id}
                                  value={user.id || user._id}
                                >
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {user.name} {user.lastName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {user.email}
                                      {user.phoneNumber &&
                                        ` • ${user.phoneNumber}`}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            {officeContacts.every((u) =>
                              selectedContacts.some(
                                (c) =>
                                  c.name === `${u.name} ${u.lastName}`.trim() &&
                                  c.email === (u.email || ""),
                              ),
                            ) && (
                              <MenuItem disabled value="">
                                Todos los contactos ya fueron agregados
                              </MenuItem>
                            )}
                          </Select>
                          <FormHelperText>
                            Seleccioná y presioná "Agregar" para sumar una
                            persona
                          </FormHelperText>
                        </FormControl>
                        <Button
                          variant="contained"
                          startIcon={<Plus size={18} />}
                          onClick={() => handleAddContact(pickContactId)}
                          disabled={!pickContactId}
                          sx={{ mt: 0.5, minWidth: 120, height: 56 }}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </Grid>
                  )}

                  {/* Sin contactos en la oficina */}
                  {officeContacts.length === 0 && !showAddContact && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info">
                        Esta oficina no tiene contactos registrados. Agregá uno
                        a continuación.
                      </Alert>
                    </Grid>
                  )}

                  {/* Lista de contactos seleccionados */}
                  {selectedContacts.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ mb: 1.5 }}>
                        <Chip
                          label={`${selectedContacts.length} persona${selectedContacts.length > 1 ? "s" : ""} seleccionada${selectedContacts.length > 1 ? "s" : ""}`}
                          size="small"
                          color="primary"
                          icon={<User size={14} />}
                        />
                      </Divider>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {selectedContacts.map((c, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                              px: 2,
                              py: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderRadius: 2,
                              borderColor: "primary.light",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <User size={18} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {c.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {c.email}
                                  {c.phone && ` • ${c.phone}`}
                                  {c.role && ` • ${c.role}`}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveContact(idx)}
                            >
                              <X size={16} />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Validación: al menos un contacto */}
                  {selectedContacts.length === 0 &&
                    selectedOffice &&
                    !showAddContact && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                          Agregá al menos una persona que trae los equipos para
                          continuar.
                        </Alert>
                      </Grid>
                    )}

                  {/* Botón crear nuevo contacto */}
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="outlined"
                      startIcon={<UserPlus size={18} />}
                      onClick={() => setShowAddContact(!showAddContact)}
                      fullWidth
                      sx={{ borderRadius: 2, borderStyle: "dashed", py: 1.5 }}
                    >
                      {showAddContact
                        ? "Cancelar"
                        : "Crear Nuevo Contacto en la Oficina"}
                    </Button>
                  </Grid>

                  {/* Formulario nuevo contacto */}
                  {showAddContact && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }}>
                          <Chip label="Nuevo Contacto" size="small" />
                        </Divider>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Nombre *"
                          fullWidth
                          size="small"
                          value={newContact.name}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              name: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Apellido"
                          fullWidth
                          size="small"
                          value={newContact.lastName}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Email *"
                          fullWidth
                          size="small"
                          type="email"
                          value={newContact.email}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              email: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          size="small"
                          value={newContact.phoneNumber}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="contained"
                          startIcon={
                            createContactMutation.isPending ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Plus size={18} />
                            )
                          }
                          onClick={handleAddNewContact}
                          disabled={
                            !newContact.name ||
                            !newContact.email ||
                            createContactMutation.isPending
                          }
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          {createContactMutation.isPending
                            ? "Guardando..."
                            : "Guardar y Agregar Contacto"}
                        </Button>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: "block",
                            textAlign: "center",
                          }}
                        >
                          El contacto quedará guardado en la oficina para
                          futuras órdenes
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </>
          )}

          {!selectedOffice && selectedClient && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Seleccioná una oficina para ver y elegir el contacto.
            </Alert>
          )}
        </Box>

        {/* ── PASO 2: Carga de Equipos ── */}
        <Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <EquipmentForm onAdd={addItem} clientId={selectedClient || undefined} existingItems={items} />
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Equipos Agregados ({items.length})
              </Typography>
              {items.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: 3,
                    borderStyle: "dashed",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography color="text.secondary">
                    Agrega equipos usando el formulario de la izquierda
                  </Typography>
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Modelo</TableCell>
                        <TableCell>Serie</TableCell>
                        <TableCell>Rango</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={item._tempId || idx}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {item._modelData?.name || "Modelo Desconocido"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item._modelData?.brand
                                ? typeof item._modelData.brand === "object"
                                  ? item._modelData.brand.name
                                  : "Marca ID"
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.serialNumber}</TableCell>
                          <TableCell>{item.range || "-"}</TableCell>
                          <TableCell>
                            {item.observations ? (
                              <Typography variant="caption" color="warning.dark" sx={{ fontStyle: "italic" }}>
                                {item.observations}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeItem(item._tempId)}
                            >
                              <X size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* ── PASO 3: Confirmación ── */}
        <Box sx={{ display: activeStep === 2 ? "block" : "none" }}>
          {createMutation.isError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {(createMutation.error as any)?.response?.data?.message ??
               (createMutation.error as any)?.message ??
               "Error al crear la orden. Revisá los equipos e intentá de nuevo."}
            </Alert>
          )}
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ¡Todo listo!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Revisá los datos antes de crear la orden.
            </Typography>

            <Card
              sx={{
                maxWidth: 600,
                mx: "auto",
                mb: 3,
                textAlign: "left",
                p: 3,
                borderRadius: 3,
              }}
              variant="outlined"
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                RESUMEN
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography fontWeight="bold">Cliente:</Typography>
                  <Typography>{clientData?.socialReason || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography fontWeight="bold">Oficina:</Typography>
                  <Typography>
                    {offices?.find((o) => (o._id || o.id) === selectedOffice)
                      ?.name || "-"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography fontWeight="bold">Contacto(s):</Typography>
                  {selectedContacts.length === 0 ? (
                    <Typography color="text.secondary">—</Typography>
                  ) : (
                    selectedContacts.map((c, i) => (
                      <Typography key={i} variant="body2">
                        {c.name}
                      </Typography>
                    ))
                  )}
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography fontWeight="bold">Total Equipos:</Typography>
                  <Typography>{items.length} instrumentos</Typography>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Acciones */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ borderRadius: 3, px: 4 }}
        >
          Atrás
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={createMutation.isPending}
          sx={{ borderRadius: 3, px: 4 }}
          endIcon={
            activeStep === steps.length - 1 ? (
              <Save size={18} />
            ) : (
              <ArrowRight size={18} />
            )
          }
        >
          {activeStep === steps.length - 1
            ? createMutation.isPending
              ? "Creando..."
              : "Crear Orden"
            : "Siguiente"}
        </Button>
      </Box>
    </Box>
  );
};
