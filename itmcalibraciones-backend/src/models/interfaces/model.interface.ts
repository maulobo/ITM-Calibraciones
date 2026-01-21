import { ModelEntity } from "../schemas/model.schema";

export interface IModel extends ModelEntity {
    createdAt: Date;
    updatedAt: Date;
}
