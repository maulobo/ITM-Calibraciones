import type { StandardEquipment } from "../../standard-equipment/types";

export const EquipmentLogisticState = {
  RECEIVED: "RECEIVED",               // Ingresado en ITM
  IN_LABORATORY: "IN_LABORATORY",     // En laboratorio
  EXTERNAL: "EXTERNAL",               // En proveedor externo
  ON_HOLD: "ON_HOLD",                 // En espera (papeles, autorización, piezas)
  READY_TO_DELIVER: "READY_TO_DELIVER", // Listo para retiro
  DELIVERED: "DELIVERED",             // Entregado al cliente
} as const;

export type EquipmentLogisticState =
  (typeof EquipmentLogisticState)[keyof typeof EquipmentLogisticState];

export const EquipmentTechnicalState = {
  PENDING: "PENDING",                                   // A calibrar / pendiente
  IN_PROCESS: "IN_PROCESS",                             // En proceso
  CALIBRATED: "CALIBRATED",                             // Calibrado ✓
  VERIFIED: "VERIFIED",                                 // Verificado ✓
  MAINTENANCE: "MAINTENANCE",                           // Mantenimiento realizado ✓
  OUT_OF_SERVICE: "OUT_OF_SERVICE",                     // Fuera de servicio ✗
  RETURN_WITHOUT_CALIBRATION: "RETURN_WITHOUT_CALIBRATION", // Devolución ✗
} as const;

export type EquipmentTechnicalState =
  (typeof EquipmentTechnicalState)[keyof typeof EquipmentTechnicalState];

// Terminal states — work is done (service order can be FINISHED)
export const TERMINAL_TECHNICAL_STATES: EquipmentTechnicalState[] = [
  EquipmentTechnicalState.CALIBRATED,
  EquipmentTechnicalState.VERIFIED,
  EquipmentTechnicalState.MAINTENANCE,
  EquipmentTechnicalState.OUT_OF_SERVICE,
  EquipmentTechnicalState.RETURN_WITHOUT_CALIBRATION,
];

export const PurchaseOrderRequirement = {
  YES: "YES",
  NO: "NO",
  NOT_REQUIRED: "NOT_REQUIRED",
} as const;

export type PurchaseOrderRequirement =
  (typeof PurchaseOrderRequirement)[keyof typeof PurchaseOrderRequirement];

export interface ServiceHistoryEntry {
  serviceOrder: string;
  otCode?: string;
  entryDate: string;
  exitDate?: string;
  calibrationDate?: string;
  calibrationExpirationDate?: string;
  certificateNumber?: string;
  technicalResult?: string;
  usedStandards?: string[];
  technicianId?: string;
  technicianName?: string;
}

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
  otCode?: string;
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
  serviceHistory?: ServiceHistoryEntry[];
  office?: {
    _id: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEquipmentDTO {
  id: string;
  technicalState?: string;
  logisticState?: EquipmentLogisticState | string;
  location?: "ITM" | "EXTERNAL";
  calibrationDate?: string;
  calibrationExpirationDate?: string;
  retireDate?: string;
  remittanceNumber?: string;
  certificateNumber?: string;
  externalProvider?: ExternalProvider;
  usedStandards?: string[]; // Array de IDs de patrones
}
