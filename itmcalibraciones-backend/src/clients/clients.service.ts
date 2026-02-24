import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddClientCommand } from "./commands/add-update-client.command";
import { AddOrUpdateClientDTO } from "./dto/add-update-client.dto";
import { GetClientDTO } from "./dto/get-client.dto";
import { IClient } from "./interfaces/client.interface";
import { FindAllClientsQuery } from "./queries/get-all-clients.query";
import { StatusEnum } from "src/errors-handler/enums/status.enum";
import { throwException } from "src/errors-handler/throw-exception";

@Injectable()
export class ClientService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectModel("Client") private readonly clientModel: Model<IClient>,
    @InjectModel("ServiceOrder") private readonly serviceOrderModel: Model<any>,
  ) {}

  async addClient(addClientDTO: AddOrUpdateClientDTO) {
    return this.commandBus.execute(new AddClientCommand(addClientDTO));
  }

  async getAllClients(params?: GetClientDTO): Promise<IClient[]> {
    return this.queryBus.execute(new FindAllClientsQuery(params));
  }

  async deleteClient(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const activeCount = await this.serviceOrderModel.countDocuments({
      client: id,
      generalStatus: { $in: ["PENDING", "IN_PROCESS"] },
    });

    if (activeCount > 0) {
      throwException(StatusEnum.CLIENT_HAS_ACTIVE_ORDERS);
    }

    const result = await this.clientModel.updateOne(
      { _id: id },
      { $set: { isActive: false } },
    );
    return { deleted: result.modifiedCount > 0 };
  }
}
