import type { Model } from "../../catalog/types";

export interface Contact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ServiceOrderItem {
  model: string; // Model ID
  serialNumber: string;
  range?: string;
  tag?: string;
  // UI helper props (not sent to backend)
  _tempId?: string; 
  _modelData?: Model; // For display purposes
}

export interface CreateServiceOrderDTO {
  office: string; // Office ID
  contact: Contact;
  items: Omit<ServiceOrderItem, "_tempId" | "_modelData">[];
}

export interface ServiceOrder {
  _id: string;
  code: string;
  office: string; // Populated or ID
  contact: Contact;
  equipments: string[]; // IDs
  state: string;
  createdAt: string;
}
