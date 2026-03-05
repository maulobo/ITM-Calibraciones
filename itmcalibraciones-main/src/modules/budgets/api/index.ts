import api from "../../../api/axios";
import type { Budget, CreateBudgetDTO, BudgetStatus } from "../types";

const POPULATE = "populate=office.client&populate=advisor&populate=serviceOrder";

export const getBudgets = async (): Promise<Budget[]> => {
  const { data } = await api.get(`/badgets?${POPULATE}`);
  return data;
};

export const getBudgetById = async (id: string): Promise<Budget> => {
  const { data } = await api.get(`/badgets?_id=${id}&${POPULATE}`);
  return Array.isArray(data) ? data[0] : data;
};

export const createBudget = async (dto: CreateBudgetDTO): Promise<Budget> => {
  const { data } = await api.post("/badgets", dto);
  return data;
};

export const updateBudget = async (
  id: string,
  dto: Partial<CreateBudgetDTO>,
): Promise<Budget> => {
  const { data } = await api.put("/badgets", { id, ...dto });
  return data;
};

export const updateBudgetStatus = async (
  id: string,
  status: BudgetStatus,
): Promise<Budget> => {
  const { data } = await api.patch(`/badgets/${id}/status`, { status });
  return data;
};

export const sendBudget = async (
  id: string,
  recipients: string[],
): Promise<void> => {
  await api.post(`/badgets/${id}/send`, { recipients });
};

export const getBudgetsByEquipment = async (equipmentId: string): Promise<Budget[]> => {
  const { data } = await api.get(`/badgets/by-equipment/${equipmentId}`);
  return data;
};

// ── Portal (client USER role) ─────────────────────────────────────────────────

export const getPortalBudgets = async (): Promise<Budget[]> => {
  const { data } = await api.get("/badgets/portal");
  return data;
};

export const clientApproveBudget = async (id: string): Promise<Budget> => {
  const { data } = await api.patch(`/badgets/${id}/client-approve`);
  return data;
};

export const clientRejectBudget = async (
  id: string,
  rejectionReason?: string,
): Promise<Budget> => {
  const { data } = await api.patch(`/badgets/${id}/client-reject`, { rejectionReason });
  return data;
};
