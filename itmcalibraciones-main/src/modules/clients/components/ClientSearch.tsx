import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { Search, Plus } from "lucide-react";
import type { Client } from "../types/clientTypes";

interface ClientSearchProps {
  clients: Client[];
  onClientSelected: (client: Client | null) => void;
  onCreateNew: () => void;
  selectedClient?: Client | null;
}

export const ClientSearch = ({
  clients,
  onClientSelected,
  onCreateNew,
  selectedClient,
}: ClientSearchProps) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <Search size={18} />
        Buscar Cliente
      </Typography>

      <Stack spacing={2}>
        <Autocomplete
          value={selectedClient || null}
          onChange={(_, newValue) => {
            onClientSelected(newValue);
          }}
          options={clients}
          getOptionLabel={(option) => `${option.socialReason} - ${option.cuit}`}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {option.socialReason}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CUIT: {option.cuit} • {option.cityName}, {option.stateName}
                </Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccionar Cliente Existente"
              placeholder="Buscar por razón social o CUIT..."
            />
          )}
          noOptionsText="No se encontraron clientes"
        />

        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={onCreateNew}
          fullWidth
        >
          Crear Nuevo Cliente
        </Button>
      </Stack>
    </Box>
  );
};
