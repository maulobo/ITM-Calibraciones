import type { Brand, Model } from "../../catalog/types";

export type StandardEquipmentStatus =
  | "ACTIVO"
  | "FUERA_DE_SERVICIO"
  | "EN_CALIBRACION"
  | "VENCIDO";

export interface CertificateHistory {
  certificate: string; // URL del PDF
  uploadDate: string; // Cuando se archivó
  expirationDate: string; // Fecha de vencimiento del certificado archivado
  certificateNumber: string; // N° de certificado
}

export interface StandardEquipment {
  _id: string;
  internalCode: string;
  description: string;
  brand: Brand;
  model: Model;
  serialNumber: string;
  range?: string; // Added field
  tag?: string;
  calibrationDate: string;
  calibrationExpirationDate: string;
  certificateNumber: string;
  calibrationProvider: string; // Proveedor/Lab que calibró (ej: INTI, Viditec)
  certificateUrl?: string; // Added field
  status: StandardEquipmentStatus;
  certificateHistory: CertificateHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStandardEquipmentDTO {
  internalCode: string;
  description: string;
  brand: string; // ID
  model: string; // ID
  serialNumber: string;
  tag?: string;
  calibrationDate: string;
  calibrationExpirationDate: string;
  certificateNumber: string;
  calibrationProvider: string; // Proveedor de calibración
  status?: StandardEquipmentStatus;
}

export interface UpdateStandardEquipmentDTO extends Partial<CreateStandardEquipmentDTO> {}
