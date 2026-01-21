import { EquipmentEntity } from "../schemas/equipment.schema";

export interface IEquipment extends EquipmentEntity {
    createdAt: Date;
    updatedAt: Date;
}
