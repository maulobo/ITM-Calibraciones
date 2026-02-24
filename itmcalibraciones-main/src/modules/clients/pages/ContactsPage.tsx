import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Search, Eye, Mail, Phone, Building2, Users } from "lucide-react";
import { useContacts } from "../hooks/useContacts";
import { useAllOffices } from "../hooks/useOffices";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import { useMemo, useEffect } from "react";

export const ContactsPage = () => {
  const [search, setSearch] = useState("");
  // Fetch ALL contacts if no search, or search results if term exists.
  // We do NOT use limit/offset in the query because usersApi.getUsers returns a flat array currently (or we treat it as such)
  // and we want client side pagination for now to be consistent with Brands/Clients fix.
  // If backend started supporting pagination metadata for users, we'd need to change this.
  const { data: contactsResponse, isLoading, isFetching } = useContacts(search);
  const { data: offices = [] } = useAllOffices();
  const navigate = useNavigate();

  // Configurar paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  const contacts = Array.isArray(contactsResponse) ? contactsResponse : [];

  // Filtrar contactos localmente también, por si el backend ignora el parámetro search en este endpoint
  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const lowerSearch = search.toLowerCase();
    return contacts.filter(
      (contact) =>
        (contact.name?.toLowerCase() || "").includes(lowerSearch) ||
        (contact.lastName?.toLowerCase() || "").includes(lowerSearch) ||
        (contact.email?.toLowerCase() || "").includes(lowerSearch),
    );
  }, [contacts, search]);

  // Calcular qué items mostrar en esta página
  const paginatedContacts = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return filteredContacts.slice(start, end);
  }, [filteredContacts, pagination.offset, pagination.pageSize]);

  // Actualizar el total cuando cambien los datos
  useEffect(() => {
    pagination.setTotal(filteredContacts.length);
  }, [filteredContacts.length, pagination]);

  // Resetear a pagina 1 cuando cambia la busqueda
  useEffect(() => {
    pagination.goToPage(1);
  }, [search]);

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Contactos
          </Typography>
          <Typography color="text.secondary">
            Gestiona los usuarios y contactos de tus clientes
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por nombre, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isFetching ? (
                  <CircularProgress size={20} sx={{ mr: 1, opacity: 0.5 }} />
                ) : (
                  <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />
                )}
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ bgcolor: "background.paper" }}
        />
      </Paper>

      <TableContainer
        component={Paper}
        variant="outlined"
        elevation={0}
        sx={{ borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cliente / Oficina</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Users size={40} style={{ opacity: 0.2 }} />
                    <Typography color="text.secondary">
                      {search ? "No se encontraron contactos" : "No hay contactos registrados"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedContacts.map((contact) => (
                <TableRow key={contact.id || contact._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.main",
                          fontWeight: "bold",
                        }}
                      >
                        {contact.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="500">
                          {contact.name} {contact.lastName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontFamily="monospace"
                        >
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
                          {contact.client && typeof contact.client === "object"
                            ? (contact.client as any).socialReason
                            : contact.client || (
                                <span style={{ opacity: 0.5 }}>-</span>
                              )}
                        </Typography>
                      </Box>
                      {contact.office && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 2.5, display: "block" }}
                        >
                          {(() => {
                            if (typeof contact.office === "object")
                              return (contact.office as any).name;
                            const foundOffice = offices.find(
                              (o) =>
                                o.id === contact.office ||
                                o._id === contact.office,
                            );
                            return foundOffice ? foundOffice.name : ""; // Don't show ID if name not found
                          })()}
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
                          <Typography variant="caption">
                            {contact.phoneNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {contact.roles?.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() =>
                        navigate(`/contacts/${contact.id || contact._id}`)
                      }
                      variant="outlined"
                      color="inherit"
                      sx={{ borderColor: "divider" }}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Controles de paginación */}
      {!isLoading && contacts.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <PaginationControls
            pagination={{
              ...pagination,
              total: contacts.length,
            }}
          />
        </Paper>
      )}
    </Box>
  );
};
