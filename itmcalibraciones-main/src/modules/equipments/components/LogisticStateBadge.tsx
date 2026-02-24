import { Chip } from "@mui/material";
import {
  Package,
  FlaskConical as Flask,
  FileOutput,
  CheckCircle,
  Truck,
  Pause,
  ExternalLink,
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
        return { label: "Recibido",           color: "info"    as const, icon: <Package size={16} />      };
      case EquipmentLogisticState.IN_LABORATORY:
        return { label: "En Laboratorio",     color: "primary" as const, icon: <Flask size={16} />        };
      case EquipmentLogisticState.EXTERNAL:
        return { label: "En Externo",         color: "warning" as const, icon: <ExternalLink size={16} /> };
      case EquipmentLogisticState.ON_HOLD:
        return { label: "En Espera",          color: "default" as const, icon: <Pause size={16} />        };
      case EquipmentLogisticState.READY_TO_DELIVER:
        return { label: "Listo para Retiro",  color: "success" as const, icon: <CheckCircle size={16} /> };
      case EquipmentLogisticState.DELIVERED:
        return { label: "Entregado",          color: "success" as const, icon: <Truck size={16} />        };
      default:
        return { label: state, color: "default" as const, icon: null };
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
    case EquipmentLogisticState.RECEIVED:        return "Recibido";
    case EquipmentLogisticState.IN_LABORATORY:   return "En Laboratorio";
    case EquipmentLogisticState.EXTERNAL:        return "En Externo";
    case EquipmentLogisticState.ON_HOLD:         return "En Espera";
    case EquipmentLogisticState.READY_TO_DELIVER: return "Listo para Retiro";
    case EquipmentLogisticState.DELIVERED:       return "Entregado";
    default:                                     return state;
  }
};
