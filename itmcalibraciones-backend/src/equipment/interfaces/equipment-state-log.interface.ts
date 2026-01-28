import { EquipmentStateLogEntity } from "../schemas/equipment-state-log.schema";

export interface IEquipmentStateLog extends EquipmentStateLogEntity {
  createdAt: Date;
  updatedAt: Date;
}
