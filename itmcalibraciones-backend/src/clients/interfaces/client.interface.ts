import { ClientsEntity } from "../schemas/clients.schema";

export interface IClient extends ClientsEntity {
    createdAt: Date;
    updatedAt: Date;
}
