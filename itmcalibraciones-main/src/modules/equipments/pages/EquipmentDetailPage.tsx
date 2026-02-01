import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowLeft,
  FlaskConical,
  PackageCheck,
  Truck,
  Plane,
  Home,
  Calendar,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import * as equipmentsApi from "../api";
import { LogisticStateBadge } from "../components/LogisticStateBadge";
import { UsedStandardsDisplay } from "../components/UsedStandardsDisplay";
import { CalibrationDialog } from "../components/CalibrationDialog";
import { MoveToOutputTrayDialog } from "../components/MoveToOutputTrayDialog";
import { DeliveryDialog } from "../components/DeliveryDialog";
import { SendToExternalLabDialog } from "../components/SendToExternalLabDialog";
import { ReturnFromExternalLabDialog } from "../components/ReturnFromExternalLabDialog";
import { EquipmentLogisticState } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [outputTrayDialog, setOutputTrayDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [externalLabDialog, setExternalLabDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => equipmentsApi.getEquipmentById(id!),
    enabled: !!id,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "-";
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box>
        <Alert severity="error">Equipo no encontrado</Alert>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate("/equipments")}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const canCalibrate =
    equipment.logisticState === EquipmentLogisticState.IN_LABORATORY &&
    equipment.location !== "EXTERNAL";
  const canMoveToOutputTray =
    equipment.technicalState === "CALIBRATED" &&
    equipment.logisticState !== EquipmentLogisticState.OUTPUT_TRAY;
  const canDeliver =
    equipment.logisticState === EquipmentLogisticState.OUTPUT_TRAY ||
    equipment.logisticState === EquipmentLogisticState.READY_TO_DELIVER;
  const canReturnFromExternal = equipment.location === "EXTERNAL";
  const canSendToExternal =
    equipment.logisticState === EquipmentLogisticState.IN_LABORATORY &&
    equipment.location !== "EXTERNAL";

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate("/equipments")}
          sx={{ mb: 2 }}
        >
          Volver a Equipos
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {equipment.model?.brand?.name} {equipment.model?.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" color="text.secondary">
                S/N: <strong>{equipment.serialNumber}</strong>
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Chip label={equipment.model?.equipmentType?.type} size="small" />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {canCalibrate && (
              <Button
                variant="contained"
                startIcon={<FlaskConical size={18} />}
                onClick={() => setCalibrationDialog(true)}
              >
                Calibrar
              </Button>
            )}
            {canMoveToOutputTray && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<PackageCheck size={18} />}
                onClick={() => setOutputTrayDialog(true)}
              >
                A Bandeja
              </Button>
            )}
            {canDeliver && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Truck size={18} />}
                onClick={() => setDeliveryDialog(true)}
              >
                Entregar
              </Button>
            )}
            {canSendToExternal && (
              <Button
                variant="outlined"
                startIcon={<Plane size={18} />}
                onClick={() => setExternalLabDialog(true)}
              >
                Enviar Externo
              </Button>
            )}
            {canReturnFromExternal && (
              <Button
                variant="contained"
                color="info"
                startIcon={<Home size={18} />}
                onClick={() => setReturnDialog(true)}
              >
                Registrar Retorno
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Estado Logístico
              </Typography>
              <LogisticStateBadge
                state={equipment.logisticState || ""}
                size="medium"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Estado Técnico
              </Typography>
              <Chip
                label={equipment.technicalState || "Pendiente"}
                color={
                  equipment.technicalState === "CALIBRATED"
                    ? "success"
                    : "default"
                }
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Ubicación
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.5 }}
              >
                {equipment.location === "EXTERNAL" ? (
                  <>
                    <Plane size={18} color="#0ea5e9" />
                    <Typography variant="body2">
                      {equipment.externalProvider?.providerName ||
                        "Laboratorio Externo"}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Home size={18} color="#10b981" />
                    <Typography variant="body2">ITM Calibraciones</Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="Información General" />
          <Tab label="Patrones Utilizados" />
          <Tab label="Documentos y Seguimiento" />
        </Tabs>

        {/* Tab 1: Información General */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Marca
              </Typography>
              <Typography variant="body1" gutterBottom>
                {equipment.model?.brand?.name}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Modelo
              </Typography>
              <Typography variant="body1" gutterBottom>
                {equipment.model?.name}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Número de Serie
              </Typography>
              <Typography variant="body1" gutterBottom fontFamily="monospace">
                {equipment.serialNumber}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Tipo de Equipo
              </Typography>
              <Typography variant="body1" gutterBottom>
                {equipment.model?.equipmentType?.type}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Fecha de Calibración
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Calendar size={16} />
                <Typography variant="body1">
                  {formatDateShort(equipment.calibrationDate)}
                </Typography>
              </Stack>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Fecha de Recepción
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Calendar size={16} />
                <Typography variant="body1">
                  {formatDate(equipment.createdAt)}
                </Typography>
              </Stack>

              {equipment.deliveryDate && (
                <>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    Fecha de Entrega
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Truck size={16} />
                    <Typography variant="body1">
                      {formatDate(equipment.deliveryDate)}
                    </Typography>
                  </Stack>
                </>
              )}

              {equipment.observations && (
                <>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    Observaciones
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {equipment.observations}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          {equipment.location === "EXTERNAL" && equipment.externalProvider && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" icon={<Plane size={20} />}>
                <Typography variant="subtitle2" gutterBottom>
                  Equipo en Laboratorio Externo
                </Typography>
                <Typography variant="body2">
                  <strong>Proveedor:</strong>{" "}
                  {equipment.externalProvider.providerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Enviado:</strong>{" "}
                  {formatDate(equipment.externalProvider.sentDate)}
                </Typography>
                {equipment.externalProvider.expectedReturnDate && (
                  <Typography variant="body2">
                    <strong>Retorno esperado:</strong>{" "}
                    {formatDateShort(
                      equipment.externalProvider.expectedReturnDate,
                    )}
                  </Typography>
                )}
                {equipment.externalProvider.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Notas:</strong> {equipment.externalProvider.notes}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </TabPanel>

        {/* Tab 2: Patrones Utilizados */}
        <TabPanel value={tabValue} index={1}>
          {equipment.usedStandards && equipment.usedStandards.length > 0 ? (
            <UsedStandardsDisplay standards={equipment.usedStandards} />
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <FlaskConical
                size={48}
                color="#cbd5e1"
                style={{ marginBottom: 16 }}
              />
              <Typography color="text.secondary">
                Este equipo aún no ha sido calibrado. Los patrones utilizados
                aparecerán aquí después de la calibración.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Tab 3: Documentos y Seguimiento */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {equipment.remittanceNumber && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <FileText size={18} color="#3b82f6" />
                      <Typography variant="subtitle2">
                        Número de Remito
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontFamily="monospace">
                      {equipment.remittanceNumber}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {equipment.certificateNumber && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <FileText size={18} color="#10b981" />
                      <Typography variant="subtitle2">
                        Número de Certificado
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontFamily="monospace">
                      {equipment.certificateNumber}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {!equipment.remittanceNumber && !equipment.certificateNumber && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <FileText
                    size={48}
                    color="#cbd5e1"
                    style={{ marginBottom: 16 }}
                  />
                  <Typography color="text.secondary">
                    No hay documentos registrados aún
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <CalibrationDialog
        open={calibrationDialog}
        onClose={() => setCalibrationDialog(false)}
        equipment={equipment}
      />

      <MoveToOutputTrayDialog
        open={outputTrayDialog}
        onClose={() => setOutputTrayDialog(false)}
        equipment={equipment}
      />

      <DeliveryDialog
        open={deliveryDialog}
        onClose={() => setDeliveryDialog(false)}
        equipment={equipment}
      />

      <SendToExternalLabDialog
        open={externalLabDialog}
        onClose={() => setExternalLabDialog(false)}
        equipment={equipment}
      />

      <ReturnFromExternalLabDialog
        open={returnDialog}
        onClose={() => setReturnDialog(false)}
        equipment={equipment}
      />
    </Box>
  );
};
