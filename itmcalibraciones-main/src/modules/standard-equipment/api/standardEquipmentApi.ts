import api from "../../../api/axios";
import type {
  StandardEquipment,
  CreateStandardEquipmentDTO,
  UpdateStandardEquipmentDTO,
} from "../types";

export const getStandardEquipment = async (): Promise<StandardEquipment[]> => {
  const { data } = await api.get("/standard-equipment");
  return data;
};

export const getStandardEquipmentById = async (
  id: string,
): Promise<StandardEquipment> => {
  const { data } = await api.get(`/standard-equipment/${id}`);
  return data;
};

export const createStandardEquipment = async (
  dto: CreateStandardEquipmentDTO,
): Promise<StandardEquipment> => {
  const { data } = await api.post("/standard-equipment", dto);
  return data;
};

export const updateStandardEquipment = async (
  id: string,
  dto: UpdateStandardEquipmentDTO,
): Promise<StandardEquipment> => {
  const { data } = await api.patch(`/standard-equipment/${id}`, dto);
  return data;
};

export const deleteStandardEquipment = async (id: string): Promise<void> => {
  await api.delete(`/standard-equipment/${id}`);
};
