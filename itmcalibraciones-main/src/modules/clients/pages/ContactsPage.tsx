import { useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, InputAdornment, Button, Chip, Avatar } from "@mui/material";
import { Search, Eye, Mail, Phone, Building2 } from "lucide-react";
import { useContacts } from "../hooks/useContacts";
import { useNavigate } from "react-router-dom";

export const ContactsPage = () => {
    const [search, setSearch] = useState("");
    const { data: contacts = [], isLoading } = useContacts(search);
    const navigate = useNavigate();

    return (
        <Box>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Contactos</Typography>
                    <Typography color="text.secondary">Gestiona los usuarios y contactos de tus clientes</Typography>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por nombre, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                />
            </Paper>

            <TableContainer component={Paper} variant="outlined" elevation={0} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: "background.default" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Cliente / Oficina</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">Cargando contactos...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : contacts.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No se encontraron contactos</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact) => (
                            <TableRow key={contact.id || contact._id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>
                                            {contact.name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="500">{contact.name} {contact.lastName}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                ID: {(contact.id || contact._id)?.slice(-6)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                     <Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Building2 size={14} style={{ opacity: 0.5 }} />
                                            <Typography variant="body2" fontWeight="500">
                                                {contact.client && typeof contact.client === 'object' 
                                                    ? (contact.client as any).socialReason 
                                                    : contact.client || <span style={{ opacity: 0.5 }}>-</span>}
                                            </Typography>
                                        </Box>
                                        {contact.office && (
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5, display: 'block' }}>
                                                 {typeof contact.office === 'object' ? (contact.office as any).name : "Oficina " + contact.office}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" flexDirection="column" gap={0.5}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Mail size={14} style={{ opacity: 0.5 }} />
                                            <Typography variant="body2">{contact.email}</Typography>
                                        </Box>
                                        {contact.phoneNumber && (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Phone size={14} style={{ opacity: 0.5 }} />
                                                <Typography variant="caption">{contact.phoneNumber}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" gap={0.5} flexWrap="wrap">
                                        {contact.roles?.map(role => (
                                            <Chip key={role} label={role} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Button 
                                        size="small" 
                                        startIcon={<Eye size={16} />}
                                        onClick={() => navigate(`/contacts/${contact.id || contact._id}`)}
                                        variant="outlined"
                                        color="inherit"
                                        sx={{ borderColor: 'divider' }}
                                    >
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
