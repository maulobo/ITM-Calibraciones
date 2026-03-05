import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Search } from "lucide-react";
import api from "../../../api/axios";

interface EquipmentResult {
  _id: string;
  serialNumber: string;
  otCode?: string;
  serviceOrder?: { _id: string; code: string } | string;
  model?: { name?: string; brand?: { name?: string }; equipmentType?: { type?: string } } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (linkedOtCode: string, linkedEquipmentId: string) => void;
}

export const LinkOtDialog = ({ open, onClose, onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EquipmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(
        `/equipments/search?q=${encodeURIComponent(query)}&populate=serviceOrder`,
      );
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (eq: EquipmentResult) => {
    const otCode =
      eq.otCode ??
      (typeof eq.serviceOrder === "object" && eq.serviceOrder !== null
        ? eq.serviceOrder.code
        : undefined) ??
      "";
    onSelect(otCode, eq._id);
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    onClose();
  };

  const getEquipmentLabel = (eq: EquipmentResult) => {
    const type = eq.model?.equipmentType?.type ?? "";
    const brand = eq.model?.brand?.name ?? "";
    const name = eq.model?.name ?? "";
    return [type, brand, name].filter(Boolean).join(" · ") || "Equipo";
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular Servicio Técnico</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Buscá por N/S del equipo para vincularlo a este ítem.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ingresá el N/S del equipo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            startIcon={loading ? <CircularProgress size={14} /> : <Search size={16} />}
          >
            Buscar
          </Button>
        </Box>

        {searched && !loading && results.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No se encontraron equipos con ese N/S.
          </Typography>
        )}

        {results.length > 0 && (
          <List dense disablePadding>
            {results.map((eq) => {
              const otCode =
                eq.otCode ??
                (typeof eq.serviceOrder === "object" && eq.serviceOrder !== null
                  ? eq.serviceOrder.code
                  : undefined);
              return (
                <ListItemButton
                  key={eq._id}
                  onClick={() => handleSelect(eq)}
                  sx={{ borderRadius: 2, mb: 0.5, border: "1px solid", borderColor: "divider" }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" fontWeight={600}>
                          N/S: {eq.serialNumber}
                        </Typography>
                        {otCode && (
                          <Typography variant="caption" color="primary.main">
                            {otCode}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={getEquipmentLabel(eq)}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};
