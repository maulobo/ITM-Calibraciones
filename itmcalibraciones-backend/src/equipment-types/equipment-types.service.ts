import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddEquipmentTypeCommand } from './commands/add-equipment-types.command';
import { AddEquipmentTypesDTO } from './dto/add-equipment-types.dto';
import { FindAllEquipmentTypesQuery } from './queries/get-all-equipment-types.query';


@Injectable()
export class EquipmentTypesService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async addEquipmentType(addEquipmentTypesDTO: AddEquipmentTypesDTO) { 
        return this.commandBus.execute(new AddEquipmentTypeCommand(addEquipmentTypesDTO));
    }

    async getAllEquipmentTypes() { 
        return this.queryBus.execute(new FindAllEquipmentTypesQuery());
    }

}
