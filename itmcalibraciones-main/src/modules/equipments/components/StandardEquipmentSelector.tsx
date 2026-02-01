import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  OutlinedInput,
  type SelectChangeEvent,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useStandardEquipment } from "../../standard-equipment/hooks/useStandardEquipment";

interface StandardEquipmentSelectorProps {
  value: string[]; // Array de IDs seleccionados
  onChange: (ids: string[]) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
}

export const StandardEquipmentSelector = ({
  value = [],
  onChange,
  error,
  helperText,
  label = "Patrones Utilizados",
  placeholder = "Selecciona los patrones usados en la calibración",
}: StandardEquipmentSelectorProps) => {
  const { data: standards, isLoading } = useStandardEquipment();

  // Filtrar solo patrones ACTIVOS
  const activeStandards = standards?.filter((s) => s.status === "ACTIVO") || [];

  // Calcular los patrones seleccionados para mostrar los chips
  const selectedStandards = standards?.filter((s) => value.includes(s._id)) || [];

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedIds = event.target.value as string[];
    onChange(selectedIds);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Cargando patrones...
        </Typography>
      </Box>
    );
  }

  if (!activeStandards || activeStandards.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "warning.lighter",
          border: "1px solid",
          borderColor: "warning.light",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AlertCircle size={20} color="#ed6c02" />
        <Typography variant="body2" color="warning.dark">
          No hay patrones activos disponibles. Debes tener al menos un patrón
          activo para calibrar equipos.
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={() => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selectedStandards.map((standard) => (
              <Chip
                key={standard._id}
                label={`${standard.internalCode} - ${standard.description}`}
                size="small"
                icon={<ShieldCheck size={14} />}
                sx={{ bgcolor: "primary.lighter" }}
              />
            ))}
          </Box>
        )}
      >
        {activeStandards.map((standard) => (
          <MenuItem key={standard._id} value={standard._id}>
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ShieldCheck size={16} />
                <Typography variant="body2" fontWeight={500}>
                  {standard.internalCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  S/N: {standard.serialNumber}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 3 }}
              >
                {standard.description} - {standard.brand?.name}{" "}
                {standard.model?.name}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ ml: 3 }}>
                Cert: {standard.certificateNumber} |{" "}
                {standard.calibrationProvider}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {value.length === 0 && !error && (
        <FormHelperText>💡 {placeholder}</FormHelperText>
      )}
    </FormControl>
  );
};
