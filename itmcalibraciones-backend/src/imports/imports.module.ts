import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersModule } from 'src/users/users.module';

import { BrandsModule } from 'src/brands/brands.module';
import { CityModule } from 'src/city/city.module';
import { ClientsModule } from 'src/clients/clients.module';
import { EquipmentTypesModule } from 'src/equipment-types/equipment-types.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { ModelModule } from 'src/models/models.module';
import { OfficesModule } from 'src/offices/offices.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';


const QueriesHandler = [
  
];

const CommandHandlers = [
]

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    CityModule,
    ClientsModule,
    OfficesModule,
    EquipmentModule,
    EquipmentTypesModule,
    BrandsModule,
    ModelModule
  ],
  providers: [
    ImportsService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [ImportsService],
  controllers: [ImportsController],
})
export class ImportsModule {}
