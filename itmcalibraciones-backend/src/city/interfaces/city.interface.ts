import { CityEntity } from "../schemas/city";

export interface ICity extends CityEntity {
    createdAt: Date;
    updatedAt: Date;
}
