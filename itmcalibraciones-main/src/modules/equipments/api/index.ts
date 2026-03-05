import api from "../../../api/axios";
import type { Equipment, UpdateEquipmentDTO } from "../types";

export const getEquipments = async (search?: string, clientId?: string, tag?: string): Promise<Equipment[]> => {
  if (!search && !tag) return [];
  const params = new URLSearchParams();
  if (search) params.append("q", search);
  if (clientId) params.append("client", clientId);
  if (tag) params.append("tag", tag);
  const { data } = await api.get(`/equipments/search?${params.toString()}`);
  return data;
};

export const getAllEquipments = async (): Promise<Equipment[]> => {
  const { data } = await api.get(`/equipments`);
  return data;
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const { data } = await api.get(`/equipments/${id}`);
  return data;
};

export const updateEquipment = async (
  dto: UpdateEquipmentDTO,
): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments`, dto);
  return data;
};

export interface RegisterCalibrationPayload {
  calibrationDate: string;
  calibrationExpirationDate: string;
  certificateNumber?: string;
  usedStandards?: string[];
}

export const registerCalibration = async (
  id: string,
  dto: RegisterCalibrationPayload,
): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments/${id}/calibration`, dto);
  return data;
};

export type NonCalibrationResult =
  | "BLOCKED"
  | "VERIFIED"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "RETURN_WITHOUT_CALIBRATION";

export interface RegisterTechnicalResultPayload {
  technicalResult: NonCalibrationResult;
  observations?: string;
  blockReason?: string;
}

export const registerTechnicalResult = async (
  id: string,
  dto: RegisterTechnicalResultPayload,
): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments/${id}/result`, dto);
  return data;
};

export const unblockEquipment = async (id: string): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments/${id}/unblock`);
  return data;
};

export const sendBlockNotification = async (id: string): Promise<void> => {
  await api.post(`/equipments/${id}/block-notification`);
};

export const clientRequestReturn = async (id: string): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments/${id}/client-return`);
  return data;
};

export interface DeliverEquipmentPayload {
  deliveredTo: string;
  retireDate?: string;
  remittanceNumber?: string;
  certificateNumber?: string;
}

export const deliverEquipment = async (
  id: string,
  dto: DeliverEquipmentPayload,
): Promise<Equipment> => {
  const { data } = await api.patch(`/equipments/${id}/deliver`, dto);
  return data;
};
