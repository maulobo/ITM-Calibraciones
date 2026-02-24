import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings,
  Users,
  Eye,
  ClipboardList,
  Wrench,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useClients } from "../hooks/useClients";
import { useOfficesByClient } from "../hooks/useOffices";
import { useClientUsers } from "../hooks/useClientUsers";
import { useServiceOrdersByClient } from "../../service-orders/hooks/useServiceOrders";
import { OfficeFormDialog } from "../components/OfficeFormDialog";
import { UserFormDialog } from "../components/UserFormDialog";
import type { Office } from "../types/officeTypes";
import type { ServiceOrderStatus } from "../../service-orders/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Avatar color palette (same as ClientsPage) ─────────────────────────────
const AVATAR_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#d97706", "#059669", "#0891b2", "#4f46e5",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Service Order Status chip ───────────────────────────────────────────────
const SO_STATUS: Record<ServiceOrderStatus, { label: string; color: "default" | "info" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Pendiente",   color: "default" },
  IN_PROCESS: { label: "En proceso",  color: "info"    },
  FINISHED:   { label: "Terminado",   color: "success" },
  DELIVERED:  { label: "Entregado",   color: "warning" },
  CANCELLED:  { label: "Cancelado",   color: "error"   },
};

const StatusChip = ({ status }: { status: ServiceOrderStatus }) => {
  const s = SO_STATUS[status] ?? { label: status, color: "default" as const };
  return <Chip label={s.label} color={s.color} size="small" variant="outlined" />;
};

// ─── Logistic state label ────────────────────────────────────────────────────
const LOGISTIC_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "error" }> = {
  RECEIVED:        { label: "Recibido",          color: "primary"  },
  IN_LABORATORY:   { label: "En lab",            color: "warning"  },
  EXTERNAL:        { label: "En externo",        color: "warning"  },
  ON_HOLD:         { label: "En espera",         color: "error"    },
  READY_TO_DELIVER:{ label: "Listo para retiro", color: "success"  },
  DELIVERED:       { label: "Entregado",         color: "default"  },
};
const LogisticChip = ({ state }: { state?: string }) => {
  const s = state ? (LOGISTIC_LABELS[state] ?? { label: state, color: "default" as const }) : null;
  if (!s) return <Typography variant="caption" color="text.disabled">—</Typography>;
  return <Chip label={s.label} color={s.color} size="small" />;
};

// ─── Tab panel ───────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon, text, action }: { icon: React.ReactNode; text: string; action?: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
      <Box sx={{ opacity: 0.18, mb: 2 }}>{icon}</Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>{text}</Typography>
      {action}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const ClientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);

  // Data
  const { data: clientsResponse, isLoading: isLoadingClients } = useClients();
  const clients = clientsResponse?.data || [];
  const client = clients.find((c) => c.id === id || c._id === id);
  const clientId = client?._id || client?.id || "";

  const { data: offices = [], isLoading: isLoadingOffices } = useOfficesByClient(clientId);
  const { data: serviceOrders = [], isLoading: isLoadingOrders } = useServiceOrdersByClient(clientId);
  const { data: contacts = [], isLoading: isLoadingContacts } = useClientUsers(clientId);

  // Aggregate equipments from all OTs (deduplicated by _id)
  const equipments = useMemo(() => {
    const seen = new Set<string>();
    const result = [];
    for (const order of serviceOrders) {
      for (const eq of order.equipments ?? []) {
        const eqId = eq._id || eq.id;
        if (eqId && !seen.has(eqId)) {
          seen.add(eqId);
          result.push(eq);
        }
      }
    }
    return result;
  }, [serviceOrders]);

  const color = client ? avatarColor(client.socialReason) : "#2563eb";

  // ─── Loading / not found states ────────────────────────────────────────────
  if (isLoadingClients) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary">Cliente no encontrado</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/clients")} sx={{ mt: 2 }}>
          Volver a Clientes
        </Button>
      </Box>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try { return format(new Date(dateStr), "dd/MM/yyyy", { locale: es }); } catch { return dateStr; }
  };

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        {/* Back button */}
        <Button
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate("/clients")}
          size="small"
          sx={{
            mb: 2,
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 500,
            p: 0,
            minWidth: "auto",
            "&:hover": { bgcolor: "transparent", color: "text.primary" },
          }}
          disableRipple
        >
          Volver a Clientes
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 3 }}>
          {/* Avatar + info */}
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: color,
                fontSize: "2rem",
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: `0 4px 16px ${color}40`,
              }}
            >
              {client.socialReason.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px" sx={{ lineHeight: 1.2 }}>
                {client.socialReason}
              </Typography>

              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                flexWrap="wrap"
                sx={{ mt: 0.75, gap: 1.5, color: "text.secondary" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FileText size={13} />
                  <Typography variant="body2" fontFamily="monospace">{client.cuit}</Typography>
                </Box>
                {(client.cityData?.name || client.cityName) && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ height: 14, alignSelf: "center" }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MapPin size={13} />
                      <Typography variant="body2">
                        {client.cityData?.name || client.cityName}
                        {(client.stateData?.nombre || client.stateName) && `, ${client.stateData?.nombre || client.stateName}`}
                      </Typography>
                    </Box>
                  </>
                )}
                {client.email && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ height: 14, alignSelf: "center" }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Mail size={13} />
                      <Typography variant="body2">{client.email}</Typography>
                    </Box>
                  </>
                )}
                {client.phoneNumber && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ height: 14, alignSelf: "center" }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Phone size={13} />
                      <Typography variant="body2">{client.phoneNumber}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          {/* KPI mini-cards */}
          <Stack direction="row" spacing={2}>
            <Paper
              elevation={0}
              sx={{
                px: 2.5, py: 1.5, textAlign: "center", borderRadius: 2,
                border: "1px solid", borderColor: "divider", minWidth: 90,
              }}
            >
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {offices.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                Sucursales
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 2.5, py: 1.5, textAlign: "center", borderRadius: 2,
                border: "1px solid", borderColor: "divider", minWidth: 90,
              }}
            >
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {serviceOrders.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                Órdenes
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 2.5, py: 1.5, textAlign: "center", borderRadius: 2,
                border: "1px solid", borderColor: "divider", minWidth: 90,
              }}
            >
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {equipments.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                Equipos
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Paper>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "background.paper" }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem", minHeight: 52 } }}
          >
            <Tab icon={<ClipboardList size={16} />} iconPosition="start" label={`Órdenes${serviceOrders.length ? ` (${serviceOrders.length})` : ""}`} />
            <Tab icon={<Wrench size={16} />}         iconPosition="start" label={`Equipos${equipments.length ? ` (${equipments.length})` : ""}`} />
            <Tab icon={<Building2 size={16} />}      iconPosition="start" label={`Sucursales${offices.length ? ` (${offices.length})` : ""}`} />
            <Tab icon={<Users size={16} />}          iconPosition="start" label={`Contactos${contacts.length ? ` (${contacts.length})` : ""}`} />
          </Tabs>
        </Box>

        {/* ── Tab 0: Órdenes de Servicio ───────────────────────────────── */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {isLoadingOrders ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={32} /></Box>
            ) : serviceOrders.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={56} />}
                text="Sin órdenes de servicio"
                action={
                  <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => navigate("/service-orders/new")}>
                    Nueva Orden
                  </Button>
                }
              />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                      <TableCell>Código</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell align="center">Equipos</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serviceOrders.map((order) => (
                      <TableRow key={order._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/service-orders/${order._id}`)}>
                        <TableCell>
                          <Chip
                            label={order.code}
                            size="small"
                            sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "action.selected", borderRadius: 1, height: 24 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>
                          {order.office?.name ?? "—"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={order.equipments?.length ?? 0} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={order.generalStatus} />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Ver orden">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/service-orders/${order._id}`)}>
                              <Eye size={15} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* ── Tab 1: Equipos ───────────────────────────────────────────── */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {isLoadingOrders ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={32} /></Box>
            ) : equipments.length === 0 ? (
              <EmptyState
                icon={<Wrench size={56} />}
                text="Sin equipos registrados"
              />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 0.5 } }}>
                      <TableCell>N° Serie</TableCell>
                      <TableCell>Tag</TableCell>
                      <TableCell>Rango</TableCell>
                      <TableCell>Estado Logístico</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipments.map((eq) => (
                      <TableRow key={eq._id || eq.id} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.85rem" }}>
                          {eq.serialNumber ?? "—"}
                        </TableCell>
                        <TableCell>
                          {eq.tag
                            ? <Chip label={eq.tag} size="small" sx={{ borderRadius: 1, height: 22, bgcolor: "action.selected", fontWeight: 500, fontSize: "0.75rem" }} />
                            : <Typography variant="caption" color="text.disabled">—</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                          {eq.range ?? "—"}
                        </TableCell>
                        <TableCell>
                          <LogisticChip state={eq.logisticState} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver equipo">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/equipments/${eq._id || eq.id}`)}
                            >
                              <Eye size={15} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* ── Tab 2: Sucursales (cards) ─────────────────────────────────── */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => { setSelectedOffice(null); setOfficeDialogOpen(true); }}
              >
                Nueva Sucursal
              </Button>
            </Box>

            {isLoadingOffices ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={32} /></Box>
            ) : offices.length === 0 ? (
              <EmptyState
                icon={<Building2 size={56} />}
                text="Sin sucursales registradas"
                action={
                  <Button variant="outlined" startIcon={<Building2 size={16} />} onClick={() => { setSelectedOffice(null); setOfficeDialogOpen(true); }}>
                    Crear Primera Sucursal
                  </Button>
                }
              />
            ) : (
              <Grid container spacing={2}>
                {offices.map((office) => (
                  <Grid key={office._id || office.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.18s ease",
                        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.09)", borderColor: "primary.light" },
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                          <Avatar
                            sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: "1rem", fontWeight: 700 }}
                          >
                            {office.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                            {office.name}
                          </Typography>
                        </Box>

                        <Stack spacing={0.6}>
                          {(office.cityName || office.stateName) && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <MapPin size={13} color="#94a3b8" />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {[office.cityName, office.stateName].filter(Boolean).join(", ")}
                              </Typography>
                            </Box>
                          )}
                          {office.adress && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FileText size={13} color="#94a3b8" />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {office.adress}
                              </Typography>
                            </Box>
                          )}
                          {office.responsable && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Users size={13} color="#94a3b8" />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {office.responsable}
                              </Typography>
                            </Box>
                          )}
                          {office.phoneNumber && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Phone size={13} color="#94a3b8" />
                              <Typography variant="caption" color="text.secondary">
                                {office.phoneNumber}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 1.5, pt: 0.5, justifyContent: "flex-end" }}>
                        <Tooltip title="Ver detalle">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/offices/${office._id || office.id}`)}>
                            <Eye size={15} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => { setSelectedOffice(office); setOfficeDialogOpen(true); }}>
                            <Settings size={15} />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* ── Tab 3: Contactos ─────────────────────────────────────────── */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setUserFormOpen(true)}
              >
                Nuevo Usuario
              </Button>
            </Box>

            {isLoadingContacts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={32} /></Box>
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={<Users size={56} />}
                text="Sin contactos registrados"
                action={
                  <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => setUserFormOpen(true)}>
                    Crear Primer Usuario
                  </Button>
                }
              />
            ) : (
              <List disablePadding>
                {contacts.map((user, idx) => {
                  const initials = `${user.name?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase();
                  const fullName = `${user.name} ${user.lastName}`.trim();
                  const userColor = avatarColor(fullName || "X");
                  return (
                    <Box key={user.id || user._id}>
                      {idx > 0 && <Divider variant="inset" component="li" />}
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: userColor, fontWeight: 700, width: 44, height: 44 }}>
                            {initials || "?"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Typography fontWeight={600}>{fullName || "—"}</Typography>
                              {user.roles?.map((r) => (
                                <Chip key={r} label={r} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem", borderRadius: 1 }} />
                              ))}
                            </Box>
                          }
                          secondary={
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                              {user.email && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Mail size={12} color="#94a3b8" />
                                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                </Box>
                              )}
                              {user.phoneNumber && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Phone size={12} color="#94a3b8" />
                                  <Typography variant="caption" color="text.secondary">{user.phoneNumber}</Typography>
                                </Box>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <OfficeFormDialog
        open={officeDialogOpen}
        onClose={() => { setOfficeDialogOpen(false); setSelectedOffice(null); }}
        office={selectedOffice}
      />

      <UserFormDialog
        open={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        clientId={clientId}
        offices={offices}
      />
    </Box>
  );
};
