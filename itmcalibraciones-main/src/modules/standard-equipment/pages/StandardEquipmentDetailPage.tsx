import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Hash,
  Activity,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  History,
} from "lucide-react";
import { useStandardEquipmentById } from "../hooks/useStandardEquipment";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { StandardEquipmentStatus } from "../types";

const StatusBadge = ({ status }: { status: StandardEquipmentStatus }) => {
  const config = {
    ACTIVO: { color: "success" as const, label: "Activo" },
    FUERA_DE_SERVICIO: { color: "error" as const, label: "Fuera de Servicio" },
    EN_CALIBRACION: { color: "warning" as const, label: "En Calibración" },
    VENCIDO: { color: "error" as const, label: "Vencido" },
  };
  const { color, label } = config[status] || {
    color: "default",
    label: status,
  };

  return (
    <Chip
      label={label}
      color={color}
      sx={{ fontWeight: "bold", borderRadius: "8px", px: 1 }}
    />
  );
};

// Helper seguro para fechas
const formatDateSafe = (dateString?: string, formatStr = "dd/MM/yyyy") => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-"; // Fecha inválida
  return format(date, formatStr, { locale: es });
};

export const StandardEquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: equipment,
    isLoading,
    error,
  } = useStandardEquipmentById(id || "");

  // Debug: Ver qué trae el backend
  if (equipment) {
    console.log("📋 Equipment data:", equipment);
    console.log("📜 Certificate History:", equipment.certificateHistory);
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !equipment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No se pudo cargar la información del patrón.{" "}
          {error ? error.message : ""}
        </Alert>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate("/standard-equipment")}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Volver al listado
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {equipment.internalCode}
              </Typography>
              <StatusBadge status={equipment.status} />
            </Box>
            <Typography variant="h5" color="text.primary" fontWeight={500}>
              {equipment.description}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <ShieldCheck size={18} />
              {equipment.brand.name} {equipment.model.name}
            </Typography>
          </Box>

          {equipment.certificateUrl ? (
            <Button
              variant="outlined"
              startIcon={<ExternalLink size={18} />}
              href={equipment.certificateUrl}
              target="_blank"
              component="a"
            >
              Ver Certificado Vigente
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<ExternalLink size={18} />}
              disabled
            >
              Sin Certificado
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 
        Left Column: Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Main Info Card */}
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Activity size={20} /> Información Técnica
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Tag size={14} /> ID / CÓDIGO INTERNO
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.internalCode}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Activity size={14} /> PROVEEDOR DE CALIBRACIÓN
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.calibrationProvider}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Hash size={14} /> NÚMERO DE SERIE
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.serialNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      RANGO
                    </Typography>
                    <Typography variant="body1">
                      {equipment.range || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      TAG / ETIQUETA
                    </Typography>
                    <Typography variant="body1">
                      {equipment.tag || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* History Card */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <History /> Historial de Certificados
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer
                component={Paper}
                elevation={0}
                variant="outlined"
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: "background.neutral" }}>
                    <TableRow>
                      <TableCell>Fecha Archivo</TableCell>
                      <TableCell>N° Certificado</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell align="right">PDF</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipment.certificateHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No hay historial disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipment.certificateHistory.map((hist, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {formatDateSafe(hist.uploadDate)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {hist.certificateNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDateSafe(hist.expirationDate)}
                          </TableCell>
                          <TableCell align="right">
                            {hist.certificate ? (
                              <IconButton
                                size="small"
                                component="a"
                                href={hist.certificate}
                                target="_blank"
                                color="primary"
                              >
                                <Download size={16} />
                              </IconButton>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                No PDF
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Status & Preview */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{ borderRadius: 3, boxShadow: 2, bgcolor: "background.paper" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FileText size={20} /> Certificado Actual
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                  p: 2,
                  bgcolor: "primary.lighter",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {differenceInDays(
                    new Date(equipment.calibrationExpirationDate),
                    new Date(),
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Días restantes de vigencia
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Calendar size={14} /> FECHA CALIBRACIÓN
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {formatDateSafe(
                      equipment.calibrationDate,
                      "dd 'de' MMMM, yyyy",
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <AlertTriangle
                      size={14}
                      color={equipment.status === "VENCIDO" ? "red" : "gray"}
                    />
                    VENCIMIENTO
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color={
                      equipment.status === "VENCIDO"
                        ? "error.main"
                        : "text.primary"
                    }
                  >
                    {formatDateSafe(
                      equipment.calibrationExpirationDate,
                      "dd 'de' MMMM, yyyy",
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    N° CERTIFICADO
                  </Typography>
                  <Typography variant="body1">
                    {equipment.certificateNumber}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper for days difference
function differenceInDays(date1: string | Date | undefined, date2: Date) {
  if (!date1) return 0;
  const d1 = new Date(date1);
  if (isNaN(d1.getTime())) return 0;

  const diffTime = Math.abs(d1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return d1 < date2 ? -diffDays : diffDays;
}
