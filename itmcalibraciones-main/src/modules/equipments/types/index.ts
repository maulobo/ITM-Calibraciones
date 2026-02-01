import type { StandardEquipment } from "../../standard-equipment/types";

export const EquipmentLogisticState = {
  RECEIVED: "RECEIVED", // Ingreso
  IN_LABORATORY: "IN_LABORATORY", // En Laboratorio
  OUTPUT_TRAY: "OUTPUT_TRAY", // Bandeja de Salida (Falta papeles/admin)
  READY_TO_DELIVER: "READY_TO_DELIVER", // Listo para retirar
  DELIVERED: "DELIVERED", // Retirado
  ON_HOLD: "ON_HOLD", // Frenado (Espera)
} as const;

export type EquipmentLogisticState =
  (typeof EquipmentLogisticState)[keyof typeof EquipmentLogisticState];

export const PurchaseOrderRequirement = {
  YES: "YES",
  NO: "NO",
  NOT_REQUIRED: "NOT_REQUIRED",
} as const;

export type PurchaseOrderRequirement =
  (typeof PurchaseOrderRequirement)[keyof typeof PurchaseOrderRequirement];

export interface ExternalProvider {
  providerName: string;
  sentDate: string;
  projectedReturnDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  exitNote?: string;
  notes?: string;
}

export interface Equipment {
  _id: string;
  serialNumber: string;
  model: {
    _id: string;
    name: string;
    brand: {
      _id: string;
      name: string;
    };
    equipmentType: {
      _id: string;
      type: string;
    };
  };
  range?: string;
  tag?: string;
  technicalState?: string;
  logisticState?: EquipmentLogisticState;
  location?: "ITM" | "EXTERNAL";
  calibrationDate?: string;
  retireDate?: string;
  deliveryDate?: string;
  observations?: string;
  remittanceNumber?: string;
  certificateNumber?: string;
  externalProvider?: ExternalProvider;
  usedStandards?: StandardEquipment[]; // Patrones usados en la calibración
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEquipmentDTO {
  id: string;
  technicalState?: string;
  logisticState?: EquipmentLogisticState | string;
  location?: "ITM" | "EXTERNAL";
  calibrationDate?: string;
  retireDate?: string;
  remittanceNumber?: string;
  certificateNumber?: string;
  externalProvider?: ExternalProvider;
  usedStandards?: string[]; // Array de IDs de patrones
}
