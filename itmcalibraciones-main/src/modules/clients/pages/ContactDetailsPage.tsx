import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Avatar, Grid, Tabs, Tab, CircularProgress, Chip, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { ArrowLeft, Mail, Phone, Building2, FileText, Clock, MapPin } from "lucide-react";
import { useContact } from "../hooks/useContacts";
import { useState } from "react";

// Mock Data for Service History
const MOCK_SERVICE_HISTORY = [
    { id: "ORD-123", date: "2025-01-15", equipment: "Manómetro Digital", status: "Completado" },
    { id: "ORD-124", date: "2025-02-10", equipment: "Termómetro IR", status: "En Proceso" },
];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
  
function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export const ContactDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: contact, isLoading, error } = useContact(id || "");
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isLoading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error || !contact) return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h6">Error al cargar el contacto</Typography>
            <Button variant="outlined" onClick={() => navigate("/contacts")}>Volver a la lista</Button>
        </Box>
    );

    return (
        <Box sx={{ pb: 4 }}>
             {/* Header */}
             <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    background: "linear-gradient(to right, #ffffff, #f8fafc)",
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Button
                        startIcon={<ArrowLeft size={16} />}
                        onClick={() => navigate("/contacts")}
                        color="inherit"
                        sx={{ textTransform: "none", color: "text.secondary", p: 0, minWidth: 'auto', "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
                        disableRipple
                    >
                        Volver a Contactos
                    </Button>
                </Box>

                <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                            fontSize: "2rem",
                            fontWeight: "bold",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                    >
                        {contact.name?.charAt(0)}
                    </Avatar>
                    <Box>
                         <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
                            {contact.name} {contact.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', color: 'text.secondary', flexWrap: 'wrap' }}>
                             <Box display="flex" alignItems="center" gap={0.5}>
                                <Mail size={16} />
                                <Typography variant="body2">{contact.email}</Typography>
                             </Box>
                             {contact.phoneNumber && (
                                <>
                                    <Divider orientation="vertical" flexItem sx={{ height: 16 }} />
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Phone size={16} />
                                        <Typography variant="body2">{contact.phoneNumber}</Typography>
                                    </Box>
                                </>
                             )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                             {contact.roles?.map(role => (
                                <Chip key={role} label={role} size="small" variant="outlined" color="primary" />
                             ))}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 0, border: 1, borderColor: "divider", borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight="600">Información Corporativa</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                             <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="bold">
                                    Cliente
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <Building2 size={20} style={{ color :'#3b82f6' }} />
                                    <Typography variant="body1" fontWeight="500">
                                        {contact.client && typeof contact.client === 'object' 
                                            ? (contact.client as any).socialReason 
                                            : contact.client || "Sin Asignar"}
                                    </Typography>
                                </Box>
                             </Box>

                             <Box>
                                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="bold">
                                    Sucursal / Oficina
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <MapPin size={20} style={{ color: '#6b7280' }} />
                                    <Typography variant="body1">
                                         {contact.office && typeof contact.office === 'object' ? (contact.office as any).name : contact.office ? "Oficina " + contact.office : "Sin Asignar"}
                                    </Typography>
                                </Box>
                             </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                     <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                                <Tab label="Historial de Servicios" icon={<Clock size={16} />} iconPosition="start" />
                                <Tab label="Equipos Relacionados" icon={<FileText size={16} />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <CustomTabPanel value={tabValue} index={0}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID Orden</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Equipo</TableCell>
                                            <TableCell>Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {MOCK_SERVICE_HISTORY.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>{row.date}</TableCell>
                                                <TableCell>{row.equipment}</TableCell>
                                                <TableCell><Chip label={row.status} size="small" color={row.status === 'Completado' ? 'success' : 'warning'} variant="outlined" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CustomTabPanel>
                        
                        <CustomTabPanel value={tabValue} index={1}>
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">Funcionalidad en desarrollo</Typography>
                            </Box>
                        </CustomTabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
