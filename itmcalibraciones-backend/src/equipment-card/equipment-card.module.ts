import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';


import { AddEquipmentCardCommandHandler } from "./commands/add-equipment-card.command";
import { EquipmentCardsController } from './equipment-card.controller';
import { EquipmentCardsService } from './equipment-card.service';

import { FindAllEquipmentCardsQueryHandler } from './queries/get-all-equipment-card.query';
import { EquipmentCardSchema } from './schemas/equipment-card.schema';



const QueriesHandler = [
  FindAllEquipmentCardsQueryHandler
];

const CommandHandlers = [
  AddEquipmentCardCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'EquipmentCards', schema: EquipmentCardSchema },
    ])
  ],
  providers: [
    EquipmentCardsService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [EquipmentCardsService],
  controllers: [EquipmentCardsController],
})
export class EquipmentCardsModule {}
