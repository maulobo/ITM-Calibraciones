import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Plus, Search, Filter } from "lucide-react";

import { useNavigate } from "react-router-dom";

export const ServiceOrdersPage = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ordenes de Servicio
          </Typography>
          <Typography color="text.secondary">
            Gestión y seguimiento de órdenes de calibración y mantenimiento.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          sx={{ px: 3 }}
          onClick={() => navigate("/service-orders/new")}
        >
          Nueva Orden
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por cliente, equipo o número de orden..."
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#64748B" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="outlined" startIcon={<Filter size={18} />}>
            Filtros
          </Button>
        </Box>
      </Paper>

      {/* Placeholder for Data Grid / Table */}
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #e0e0e0",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Tabla de Ordenes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aquí se implementará la tabla con listado de órdenes, estados y
          acciones.
        </Typography>
      </Paper>
    </Box>
  );
};
