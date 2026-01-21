import { IBrand } from "./brands.type";

export interface IModel {
    id: string,
    name: string;
    brand: IBrand
}

export interface IAddModel {
    name: string;
    brand: string
}