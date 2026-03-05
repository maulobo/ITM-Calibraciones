import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { X, Mail, User } from "lucide-react";
import { useSendBlockNotification } from "../hooks/useEquipments";
import type { Equipment } from "../types";
import type { ServiceOrder } from "../../service-orders/types";

const BLOCK_TYPE_LABELS: Record<string, string> = {
  BROKEN:                    "Equipo roto / no funciona",
  NEEDS_PART:               "Requiere repuesto",
  NEEDS_EXTERNAL_MAINTENANCE:"Requiere mantenimiento externo",
  OTHER:                    "Otro motivo",
};

interface Props {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  serviceOrder: ServiceOrder | null | undefined;
  isLoadingOrder: boolean;
}

export const BlockNotificationPreviewDialog = ({
  open,
  onClose,
  equipment,
  serviceOrder,
  isLoadingOrder,
}: Props) => {
  const mutation = useSendBlockNotification();

  const blockType   = (equipment as any).blockType as string | undefined;
  const blockReason = (equipment as any).blockReason as string | undefined;
  const blockLabel  = blockType ? (BLOCK_TYPE_LABELS[blockType] ?? blockType) : "Sin especificar";

  const contacts    = serviceOrder?.contacts ?? [];
  const recipients  = contacts.filter((c) => c.email);

  const subject = `Equipo frenado en laboratorio — ${equipment.otCode ?? equipment.serialNumber}`;

  const equipmentLabel = [
    equipment.model?.equipmentType?.type,
    equipment.model?.brand?.name,
    equipment.model?.name,
  ].filter(Boolean).join(" · ");

  const handleSend = () => {
    mutation.mutate(equipment._id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Mail size={20} />
          <Typography variant="h6" fontWeight="bold">Vista previa del email</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoadingOrder ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Destinatarios */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.75 }}>
                PARA
              </Typography>
              {recipients.length === 0 ? (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  La OT no tiene contactos con email registrado. No se puede enviar.
                </Alert>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {recipients.map((c, i) => (
                    <Chip
                      key={i}
                      icon={<User size={13} />}
                      label={`${c.name} — ${c.email}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {/* Asunto */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.75 }}>
                ASUNTO
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", bgcolor: "grey.100", p: 1, borderRadius: 1 }}>
                {subject}
              </Typography>
            </Box>

            <Divider />

            {/* Preview del cuerpo */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1 }}>
                CONTENIDO
              </Typography>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, bgcolor: "#fafafa" }}>
                <Typography variant="subtitle2" color="warning.dark" fontWeight="bold" sx={{ mb: 1.5 }}>
                  ⚠️ Equipo frenado en laboratorio
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Le informamos que el siguiente equipo ha sido marcado como <strong>Frenado</strong> durante su proceso en el laboratorio.
                </Typography>

                <Stack spacing={0.75}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, fontWeight: 600 }}>OT / Código</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{equipment.otCode ?? "—"}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, fontWeight: 600 }}>Equipo</Typography>
                    <Typography variant="caption">{equipmentLabel}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, fontWeight: 600 }}>N° de Serie</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{equipment.serialNumber}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, fontWeight: 600 }}>Motivo</Typography>
                    <Chip label={blockLabel} size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
                  </Box>
                  {blockReason && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, fontWeight: 600 }}>Detalle</Typography>
                      <Typography variant="caption">{blockReason}</Typography>
                    </Box>
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                  Ante cualquier consulta, comuníquese con el laboratorio.<br />
                  <strong>ITM Calibraciones</strong>
                </Typography>
              </Box>
            </Box>

            {mutation.isError && (
              <Alert severity="error" sx={{ py: 0.5 }}>
                {(mutation.error as any)?.response?.data?.message ?? "Error al enviar el email"}
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={mutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Mail size={16} />}
          onClick={handleSend}
          disabled={mutation.isPending || isLoadingOrder || recipients.length === 0}
        >
          {mutation.isPending ? "Enviando..." : "Enviar email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
