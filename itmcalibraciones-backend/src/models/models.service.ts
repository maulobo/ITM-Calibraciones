import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddModelCommand } from './commands/add-model.command';
import { AddModelDTO } from './dto/add-model.dto';
import { GetModelsDTO } from './dto/get-model.dto';
import { FindAllModelsQuery } from './queries/get-all-models.query';


@Injectable()
export class ModelService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async addModel(addModelDTO: AddModelDTO) { 
        return this.commandBus.execute(new AddModelCommand(addModelDTO));
    }

    async getAllModels(query:GetModelsDTO) { 
        return this.queryBus.execute(new FindAllModelsQuery(query));
    }

}
