import api from "../../../api/axios";
import type { 
  EquipmentType, 
  Brand, 
  Model, 
  CreateEquipmentTypeDTO, 
  CreateBrandDTO, 
  CreateModelDTO 
} from "../types";

// --- Equipment Types ---
export const getEquipmentTypes = async (): Promise<EquipmentType[]> => {
  const { data } = await api.get("/equipment-types");
  return data;
};

export const createEquipmentType = async (dto: CreateEquipmentTypeDTO): Promise<EquipmentType> => {
  const { data } = await api.post("/equipment-types", dto);
  return data;
};

// --- Brands ---
export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get("/brands");
  return data;
};

export const createBrand = async (dto: CreateBrandDTO): Promise<Brand> => {
  const { data } = await api.post("/brands", dto);
  return data;
};

// --- Models ---
export interface ModelFilters {
  equipmentType?: string;
  brand?: string;
}

export const getModels = async (filters?: ModelFilters): Promise<Model[]> => {
  const params = new URLSearchParams();
  if (filters?.equipmentType) params.append("equipmentType", filters.equipmentType);
  if (filters?.brand) params.append("brand", filters.brand);
  
  const { data } = await api.get(`/models?${params.toString()}`);
  return data;
};

export const createModel = async (dto: CreateModelDTO): Promise<Model> => {
  const { data } = await api.post("/models", dto);
  return data;
};
