import { EquipmentTypesEntity } from "../schemas/equipment-types.schema";

export interface IEquipmentTypes extends EquipmentTypesEntity {
    createdAt: Date;
    updatedAt: Date;
}
