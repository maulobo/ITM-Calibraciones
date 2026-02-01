import api from "../../../api/axios";
import type { Equipment, UpdateEquipmentDTO } from "../types";

export const getEquipments = async (search?: string): Promise<Equipment[]> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const { data } = await api.get(`/equipments?${params.toString()}`);
  return data;
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const { data } = await api.get(`/equipments/${id}`);
  return data;
};

export const updateEquipment = async (
  dto: UpdateEquipmentDTO,
): Promise<Equipment> => {
  const { data } = await api.patch(`/equipment`, dto);
  return data;
};
