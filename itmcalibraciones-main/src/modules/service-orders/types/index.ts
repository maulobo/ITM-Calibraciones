import type { Model } from "../../catalog/types";

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  area?: string;
}

export interface ServiceOrderItem {
  model: string; // Model ID
  serialNumber: string;
  range?: string;
  tag?: string;
  observations?: string; // Entry observations (e.g. "arrived with broken screen")
  // UI helper props (not sent to backend)
  _tempId?: string;
  _modelData?: Model; // For display purposes
}

export interface CreateServiceOrderDTO {
  client: string; // Client ID
  office: string; // Office ID
  contacts: Contact[];
  items: Omit<ServiceOrderItem, "_tempId" | "_modelData">[];
  observations?: string;
  estimatedDeliveryDate?: string;
}

export interface UpdateServiceOrderDTO {
  generalStatus: ServiceOrderStatus;
}

export type ServiceOrderStatus =
  | "PENDING"
  | "IN_PROCESS"
  | "FINISHED"
  | "DELIVERED"
  | "CANCELLED";

export interface PopulatedClient {
  _id: string;
  socialReason: string;
  cuit?: string;
  email?: string;
}

export interface PopulatedOffice {
  _id: string;
  name: string;
  address?: string;
}

export interface PopulatedEquipment {
  _id: string;
  id?: string; // virtual from toObject({ virtuals: true })
  serialNumber: string;
  tag?: string;
  range?: string;
  technicalState?: string;
  logisticState?: string;
  orderIndex?: number;
  otCode?: string;
  serviceHistory?: Array<{
    serviceOrder: string;
    entryDate: string;
    entryObservations?: string;
    exitObservations?: string;
  }>;
  model?: {
    _id: string;
    name: string;
    brand?: { _id: string; name: string };
    equipmentType?: { _id: string; type: string };
  } | null;
}

export interface StatusHistoryEntry {
  from?: string;
  to: string;
  changedByName?: string;
  changedAt: string;
  note?: string;
}

export interface ServiceOrder {
  _id: string;
  id?: string; // virtual from toObject({ virtuals: true })
  code: string;
  client: PopulatedClient;
  office: PopulatedOffice;
  contacts: Contact[];
  equipments: PopulatedEquipment[];
  generalStatus: ServiceOrderStatus;
  statusHistory: StatusHistoryEntry[];
  entryDate: string;
  estimatedDeliveryDate?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}
