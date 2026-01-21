import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CityController } from './city.controller';
import { CityService } from './city.service';

import { AddStateCommandHandler } from './commands/add-state.command';
import { AddCityCommandHandler } from './commands/addCity.command';
import { FindCitiesQueryHandler } from './queries/find-cities.query';
import { FindCitiesByStateQueryHandler } from './queries/find-city.query';
import { FindAllStatesQueryHandler } from './queries/get-all-states.query';
import { CitySchema } from './schemas/city';
import { StateSchema } from './schemas/state.schema';


const QueriesHandler = [
  FindAllStatesQueryHandler,
  FindCitiesByStateQueryHandler,
  FindCitiesQueryHandler
];
const CommandHandlers = [
  AddCityCommandHandler,
  AddStateCommandHandler
  
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'State', schema: StateSchema },
      { name: 'City', schema: CitySchema },
    ])
  ],
  providers: [
    CityService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [CityService,],
  controllers: [CityController],
})
export class CityModule {}
