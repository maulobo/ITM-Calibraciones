import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddEquipmentCardCommand } from './commands/add-equipment-card.command';
import { AddEquipmentCardDTO } from './dto/add-equipment-card.dto';
import { FindAllEquipmentCardsQuery } from './queries/get-all-equipment-card.query';


@Injectable()
export class EquipmentCardsService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async addClient(addEquipmentCardDTO: AddEquipmentCardDTO) { 
        return this.commandBus.execute(new AddEquipmentCardCommand(addEquipmentCardDTO));
    }

    async getAllClients() { 
        return this.queryBus.execute(new FindAllEquipmentCardsQuery());
    }

}
