import { Chip } from "@mui/material";
import {
  Package,
  FlaskConical as Flask,
  FileOutput,
  CheckCircle,
  Truck,
  Pause,
} from "lucide-react";
import { EquipmentLogisticState } from "../types";

interface LogisticStateBadgeProps {
  state: EquipmentLogisticState | string;
  size?: "small" | "medium";
}

export const LogisticStateBadge = ({
  state,
  size = "medium",
}: LogisticStateBadgeProps) => {
  const getStateConfig = (state: string) => {
    switch (state) {
      case EquipmentLogisticState.RECEIVED:
        return {
          label: "Recibido",
          color: "info" as const,
          icon: <Package size={16} />,
        };
      case EquipmentLogisticState.IN_LABORATORY:
        return {
          label: "En Laboratorio",
          color: "primary" as const,
          icon: <Flask size={16} />,
        };
      case EquipmentLogisticState.OUTPUT_TRAY:
        return {
          label: "Bandeja de Salida",
          color: "warning" as const,
          icon: <FileOutput size={16} />,
        };
      case EquipmentLogisticState.READY_TO_DELIVER:
        return {
          label: "Listo para Retirar",
          color: "success" as const,
          icon: <CheckCircle size={16} />,
        };
      case EquipmentLogisticState.DELIVERED:
        return {
          label: "Entregado",
          color: "success" as const,
          icon: <Truck size={16} />,
        };
      case EquipmentLogisticState.ON_HOLD:
        return {
          label: "En Espera",
          color: "default" as const,
          icon: <Pause size={16} />,
        };
      default:
        return {
          label: state,
          color: "default" as const,
          icon: null,
        };
    }
  };

  const config = getStateConfig(state);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon || undefined}
      sx={{ fontWeight: 500 }}
    />
  );
};

export const getLogisticStateLabel = (
  state: EquipmentLogisticState | string,
): string => {
  switch (state) {
    case EquipmentLogisticState.RECEIVED:
      return "Recibido";
    case EquipmentLogisticState.IN_LABORATORY:
      return "En Laboratorio";
    case EquipmentLogisticState.OUTPUT_TRAY:
      return "Bandeja de Salida";
    case EquipmentLogisticState.READY_TO_DELIVER:
      return "Listo para Retirar";
    case EquipmentLogisticState.DELIVERED:
      return "Entregado";
    case EquipmentLogisticState.ON_HOLD:
      return "En Espera";
    default:
      return state;
  }
};
