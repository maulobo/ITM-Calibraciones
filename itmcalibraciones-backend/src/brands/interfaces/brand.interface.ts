import { BrandEntity } from "../schemas/brand.schema";

export interface IBrand extends BrandEntity {
    createdAt: Date;
    updatedAt: Date;
}
