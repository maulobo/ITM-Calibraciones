import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudgetStatus,
  sendBudget,
  getBudgetsByEquipment,
  getPortalBudgets,
  clientApproveBudget,
  clientRejectBudget,
} from "../api";
import type { CreateBudgetDTO, BudgetStatus } from "../types";

export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: ["budget", id],
    queryFn: () => getBudgetById(id),
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBudgetDTO) => createBudget(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudgetStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      updateBudgetStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useSendBudget = () => {
  return useMutation({
    mutationFn: ({ id, recipients }: { id: string; recipients: string[] }) =>
      sendBudget(id, recipients),
  });
};

export const useBudgetsByEquipment = (equipmentId?: string) => {
  return useQuery({
    queryKey: ["budgets", "by-equipment", equipmentId],
    queryFn: () => getBudgetsByEquipment(equipmentId!),
    enabled: !!equipmentId,
  });
};

// ── Portal hooks (client USER role) ──────────────────────────────────────────

export const usePortalBudgets = () => {
  return useQuery({
    queryKey: ["portal-budgets"],
    queryFn: getPortalBudgets,
  });
};

export const useClientApproveBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientApproveBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-budgets"] });
    },
  });
};

export const useClientRejectBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      clientRejectBudget(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-budgets"] });
    },
  });
};
