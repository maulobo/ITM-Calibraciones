export interface EquipmentType {
  _id: string;
  type: string;
  description?: string;
}

export interface Brand {
  _id: string;
  name: string;
}

export interface Model {
  _id: string;
  name: string;
  brand: string | Brand; // Can be ID or populated object
  equipmentType: string | EquipmentType; // Can be ID or populated object
  description?: string;
}

export interface CreateModelDTO {
  name: string;
  brand: string; // ID
  equipmentType: string; // ID
  description?: string;
}

export interface UpdateModelDTO {
  name?: string;
  brand?: string;
  equipmentType?: string;
  description?: string;
}

export interface CreateBrandDTO {
  name: string;
}

export interface CreateEquipmentTypeDTO {
  type: string;
  description?: string;
}
