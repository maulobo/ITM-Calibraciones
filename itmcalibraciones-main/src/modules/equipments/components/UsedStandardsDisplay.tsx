import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { ShieldCheck } from "lucide-react";
import type { StandardEquipment } from "../../standard-equipment/types";

interface UsedStandardsDisplayProps {
  standards: StandardEquipment[];
  compact?: boolean;
}

export const UsedStandardsDisplay = ({
  standards,
  compact = false,
}: UsedStandardsDisplayProps) => {
  if (!standards || standards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        No se registraron patrones utilizados
      </Typography>
    );
  }

  if (compact) {
    // Vista compacta: chips inline
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {standards.map((standard) => (
          <Chip
            key={standard._id}
            icon={<ShieldCheck size={14} />}
            label={`${standard.internalCode} - ${standard.brand?.name} ${standard.model?.name}`}
            size="small"
            sx={{ bgcolor: "primary.lighter" }}
          />
        ))}
      </Box>
    );
  }

  // Vista detallada: tabla
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="primary.main"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          <ShieldCheck size={18} />
          Patrones Utilizados en la Calibración
        </Typography>

        <Table size="small">
          <TableHead sx={{ bgcolor: "background.neutral" }}>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Marca/Modelo</TableCell>
              <TableCell>S/N</TableCell>
              <TableCell>Certificado</TableCell>
              <TableCell>Proveedor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standards.map((standard) => (
              <TableRow key={standard._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {standard.internalCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {standard.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {standard.brand?.name} {standard.model?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {standard.serialNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={500}>
                    {standard.certificateNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="success.main">
                    {standard.calibrationProvider}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
