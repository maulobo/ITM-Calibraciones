import { useState, useEffect } from "react";
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
  alpha,
  useTheme,
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
import type { CreateServiceOrderDTO, ServiceOrderItem } from "../types";

const steps = ["Cliente y Contacto", "Carga de Equipos", "Confirmación"];

interface ContactOption {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isMain?: boolean;
  isNew?: boolean;
}

export const CreateServiceOrderPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState<ServiceOrderItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const createMutation = useCreateServiceOrder();

  // Data Fetching
  const { data: clientsResponse } = useClients();
  const clients = clientsResponse?.data || [];
  const {
    data: offices,
    isLoading: isLoadingOffices,
    error: officesError,
  } = useOfficesByClient(selectedClient);

  console.log("🎯 [CreateSO] Current state:", {
    selectedClient,
    officesCount: offices?.length,
    isLoadingOffices,
    hasError: !!officesError,
  });

  const {
    control,
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
  } = useForm<CreateServiceOrderDTO>({
    defaultValues: {
      contact: {
        name: "",
        email: "",
        phone: "",
        role: "",
      },
      office: "",
      items: [],
    },
  });

  const selectedOffice = watch("office");

  const clientData = clients?.find(
    (c) => c._id === selectedClient || c.id === selectedClient,
  );

  // Build contact options when client changes
  useEffect(() => {
    if (!clientData) {
      setContactOptions([]);
      setSelectedContactId("");
      return;
    }

    const options: ContactOption[] = [];

    // Add main contact (from client's main info)
    if (clientData.responsable || clientData.email || clientData.phoneNumber) {
      options.push({
        id: "main",
        name: clientData.responsable || "",
        email: clientData.email || "",
        phone: clientData.phoneNumber || "",
        role: "Principal",
        isMain: true,
      });
    }

    // Add additional contacts
    if (clientData.contacts && Array.isArray(clientData.contacts)) {
      clientData.contacts.forEach((contact: any, index: number) => {
        options.push({
          id: `contact-${index}`,
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          role: contact.role || "",
          isMain: false,
        });
      });
    }

    setContactOptions(options);

    // Auto-select the first contact (main) if available
    if (options.length > 0) {
      const firstContact = options[0];
      setSelectedContactId(firstContact.id);
      setValue("contact.name", firstContact.name);
      setValue("contact.email", firstContact.email);
      setValue("contact.phone", firstContact.phone);
      setValue("contact.role", firstContact.role);
    }
  }, [clientData, setValue]);

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const contact = contactOptions.find((c) => c.id === contactId);
    if (contact) {
      setValue("contact.name", contact.name);
      setValue("contact.email", contact.email);
      setValue("contact.phone", contact.phone);
      setValue("contact.role", contact.role);
    }
  };

  // Handle adding a new contact
  const handleAddNewContact = () => {
    if (!newContact.name || !newContact.email || !newContact.phone) {
      alert("Por favor completa todos los campos del nuevo contacto");
      return;
    }

    // Add to contact options
    const newContactOption: ContactOption = {
      id: `new-${Date.now()}`,
      ...newContact,
      isNew: true,
    };

    setContactOptions([...contactOptions, newContactOption]);
    setSelectedContactId(newContactOption.id);
    setValue("contact.name", newContactOption.name);
    setValue("contact.email", newContactOption.email);
    setValue("contact.phone", newContactOption.phone);
    setValue("contact.role", newContactOption.role);

    // Reset form
    setShowAddContact(false);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      role: "",
    });
  };

  const handleNext = async () => {
    // Validate current step
    if (activeStep === 0) {
      if (!selectedClient) {
        // Trigger generic validation or custom error
        // But logic is cleaner if we just check state
        return;
      }
      const isValid = await trigger(["contact", "office"]);
      if (!isValid) return;
    } else if (activeStep === 1) {
      if (items.length === 0) {
        // Should show error notification
        return;
      }
    }

    if (activeStep === steps.length - 1) {
      // Submit
      onSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async () => {
    const formData = getValues();

    // Check if there are new contacts to save to the client
    const newContacts = contactOptions.filter((c) => c.isNew && !c.isMain);
    if (newContacts.length > 0 && clientData) {
      try {
        // Update client with new contacts
        const updatedContacts = [
          ...(clientData.contacts || []),
          ...newContacts.map((c) => ({
            name: c.name,
            email: c.email,
            phone: c.phone,
            role: c.role,
          })),
        ];

        // We should call the update client API here
        // For now, we'll proceed with the service order creation
        // TODO: Add client update API call
        console.log("New contacts to be added to client:", updatedContacts);
      } catch (error) {
        console.error("Error updating client contacts:", error);
      }
    }

    const payload: CreateServiceOrderDTO = {
      ...formData,
      items: items.map((i) => ({
        model: i.model,
        serialNumber: i.serialNumber,
        range: i.range,
        tag: i.tag,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        navigate(`/service-orders/${data._id}`);
      },
      onError: (err) => {
        console.error(err);
        // Show error toast
      },
    });
  };

  const addItem = (item: ServiceOrderItem) => {
    setItems([...items, item]);
  };

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
        {/* Step 1: Client, Office & Contact */}
        <Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Selección de Cliente y Oficina
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <Autocomplete
                  options={clients || []}
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
                    setValue("office", ""); // Reset office when client changes
                  }}
                />
              </FormControl>
            </Grid>

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
                    <FormHelperText>
                      {errors.office?.message ||
                        (selectedClient &&
                          offices?.length === 0 &&
                          "Este cliente no tiene oficinas registradas")}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, mt: 4 }}>
            Datos de Contacto
          </Typography>

          <Grid container spacing={3}>
            {/* Contact Selector */}
            {contactOptions.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Contacto</InputLabel>
                  <Select
                    value={selectedContactId}
                    onChange={(e) => handleContactSelect(e.target.value)}
                    label="Contacto"
                    renderValue={(value) => {
                      const contact = contactOptions.find(
                        (c) => c.id === value,
                      );
                      return contact ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <User size={16} />
                          <span>{contact.name}</span>
                          {contact.isMain && (
                            <Chip
                              label="Principal"
                              size="small"
                              color="primary"
                            />
                          )}
                          {contact.isNew && (
                            <Chip label="Nuevo" size="small" color="success" />
                          )}
                        </Box>
                      ) : (
                        ""
                      );
                    }}
                  >
                    {contactOptions.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          <User size={16} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {contact.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {contact.email}{" "}
                              {contact.phone && `• ${contact.phone}`}
                            </Typography>
                          </Box>
                          {contact.isMain && (
                            <Chip
                              label="Principal"
                              size="small"
                              color="primary"
                            />
                          )}
                          {contact.isNew && (
                            <Chip label="Nuevo" size="small" color="success" />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Selecciona un contacto existente o agrega uno nuevo
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}

            {/* Add New Contact Button */}
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                startIcon={<UserPlus size={18} />}
                onClick={() => setShowAddContact(!showAddContact)}
                fullWidth
                sx={{
                  borderRadius: 2,
                  borderStyle: "dashed",
                  py: 1.5,
                }}
              >
                {showAddContact ? "Cancelar" : "Agregar Contacto Adicional"}
              </Button>
            </Grid>

            {/* New Contact Form */}
            {showAddContact && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Nuevo Contacto" size="small" />
                  </Divider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nombre de Contacto"
                    fullWidth
                    size="small"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Teléfono"
                    fullWidth
                    size="small"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Rol / Cargo"
                    fullWidth
                    size="small"
                    value={newContact.role}
                    onChange={(e) =>
                      setNewContact({ ...newContact, role: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleAddNewContact}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Guardar y Seleccionar Contacto
                  </Button>
                </Grid>
              </>
            )}

            {/* Display selected contact info (read-only view) */}
            {selectedContactId && !showAddContact && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }}>
                    <Chip
                      label="Información del Contacto Seleccionado"
                      size="small"
                    />
                  </Divider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nombre de Contacto"
                    fullWidth
                    size="small"
                    {...register("contact.name", {
                      required: "Nombre requerido",
                    })}
                    error={!!errors.contact?.name}
                    helperText={errors.contact?.name?.message}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: alpha(theme.palette.action.hover, 0.4),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    {...register("contact.email", {
                      required: "Email requerido",
                    })}
                    error={!!errors.contact?.email}
                    helperText={errors.contact?.email?.message}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: alpha(theme.palette.action.hover, 0.4),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Teléfono"
                    fullWidth
                    size="small"
                    {...register("contact.phone", {
                      required: "Teléfono requerido",
                    })}
                    error={!!errors.contact?.phone}
                    helperText={errors.contact?.phone?.message}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: alpha(theme.palette.action.hover, 0.4),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Rol / Cargo"
                    fullWidth
                    size="small"
                    {...register("contact.role")}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: alpha(theme.palette.action.hover, 0.4),
                      },
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {/* Step 2: Equipment Load */}
        <Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
          <Grid container spacing={4}>
            {/* Form Column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <EquipmentForm onAdd={addItem} />
            </Grid>

            {/* List Column */}
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

        {/* Step 3: Confirmation */}
        <Box sx={{ display: activeStep === 2 ? "block" : "none" }}>
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
                  {/* Try to find office name */}
                  <Typography>
                    {offices?.find((o) => (o._id || o.id) === selectedOffice)
                      ?.name || "-"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography fontWeight="bold">Contacto:</Typography>
                  <Typography>{getValues("contact.name")}</Typography>
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

      {/* Actions */}
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
