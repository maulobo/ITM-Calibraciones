import { StateEntity } from "../schemas/state.schema";

export interface IState extends StateEntity {
    createdAt: Date;
    updatedAt: Date;
}
