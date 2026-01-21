import { BadgetEntity } from "../schemas/badgets.schema";

export interface IBadget extends BadgetEntity {
    createdAt: Date;
    updatedAt: Date;
}
