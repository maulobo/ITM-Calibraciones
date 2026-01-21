import { TechnicalInformEntity } from "../schemas/technical-inform.schema";

export interface ITechnicalInforms extends TechnicalInformEntity {
    createdAt: Date;
    updatedAt: Date;
}
