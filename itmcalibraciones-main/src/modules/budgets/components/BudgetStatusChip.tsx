import { Chip } from "@mui/material";
import type { BudgetStatus } from "../types";

const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; color: "default" | "success" | "error" }
> = {
  PENDING:  { label: "En espera", color: "default" },
  APPROVED: { label: "Aprobado",  color: "success" },
  REJECTED: { label: "No aprobado", color: "error" },
};

interface Props {
  status: BudgetStatus;
  size?: "small" | "medium";
}

export const BudgetStatusChip = ({ status, size = "small" }: Props) => {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "default" as const };
  return <Chip label={config.label} color={config.color} size={size} />;
};

export { STATUS_CONFIG };
