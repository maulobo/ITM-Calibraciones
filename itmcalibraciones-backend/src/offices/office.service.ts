import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddOfficeCommand } from './commands/add-or-update-office.command';
import { AddOfficeDTO } from './dto/add-office.dto';
import { GetAllOfficesDTO } from './dto/get-all-offices.dto';
import { FindAllOfficesQuery } from './queries/get-all-offices.query';


@Injectable()
export class OfficeService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async addOffice(addOfficeDTO: AddOfficeDTO) { 
        return this.commandBus.execute(new AddOfficeCommand(addOfficeDTO));
    }

    async getAllOffices(query: GetAllOfficesDTO) { 
        return this.queryBus.execute(new FindAllOfficesQuery(query));
    }

}
