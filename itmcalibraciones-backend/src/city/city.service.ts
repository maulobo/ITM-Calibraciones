import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddStateCommand } from './commands/add-state.command';
import { AddCityCommand } from './commands/addCity.command';
import { AddCityDTO, AddStateDTO, CityParamsDTO, FindCityDTO } from './dto/city.dto';
import { FindCitiesQuery } from './queries/find-cities.query';
import { FindCitiesByStateQuery } from './queries/find-city.query';
import { FindAllStatesQuery } from './queries/get-all-states.query';


@Injectable()
export class CityService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async getAllStates() { 
        return this.queryBus.execute(new FindAllStatesQuery());
    }

    async getCitiesByState(params: CityParamsDTO) { 
        return this.queryBus.execute(new FindCitiesByStateQuery(params));
    }

    async findCities(params: FindCityDTO) { 
        return this.queryBus.execute(new FindCitiesQuery(params));
    }

    async addCity(addCityDTO: AddCityDTO) { 
        return this.commandBus.execute(new AddCityCommand(addCityDTO));
    }

    async addState(addStateDTO: AddStateDTO) { 
        return this.commandBus.execute(new AddStateCommand(addStateDTO));
    }

}
