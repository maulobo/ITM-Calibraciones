import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddClientCommand } from './commands/add-update-client.command';
import { AddOrUpdateClientDTO } from './dto/add-update-client.dto';
import { GetClientDTO } from './dto/get-client.dto';
import { IClient } from './interfaces/client.interface';
import { FindAllClientsQuery } from './queries/get-all-clients.query';

@Injectable()
export class ClientService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async addClient(addClientDTO: AddOrUpdateClientDTO) { 
        return this.commandBus.execute(new AddClientCommand(addClientDTO));
    }

    async getAllClients( params?:GetClientDTO ) : Promise<IClient[]> { 
        return this.queryBus.execute(new FindAllClientsQuery(params));
    }

}
