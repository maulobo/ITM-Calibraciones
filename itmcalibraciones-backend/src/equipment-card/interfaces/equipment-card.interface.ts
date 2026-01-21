import { EquipmentCardEntity } from "../schemas/equipment-card.schema";


export interface IEquipmentCards extends EquipmentCardEntity {
    createdAt: Date;
    updatedAt: Date;
}
