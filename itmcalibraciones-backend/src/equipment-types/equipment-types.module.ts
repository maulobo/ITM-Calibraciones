import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "@nestjs/mongoose";

import { AddEquipmentTypeCommandHandler } from "./commands/add-equipment-types.command";
import { UpdateEquipmentTypeCommandHandler } from "./commands/update-equipment-types.command";
import { EquipmentTypesController } from "./equipment-types.controller";
import { EquipmentTypesService } from "./equipment-types.service";
import { FindAllEquipmentTypesQueryHandler } from "./queries/get-all-equipment-types.query";
import { EquipmentTypesSchema } from "./schemas/equipment-types.schema";

const CommandHandlers = [
  AddEquipmentTypeCommandHandler,
  UpdateEquipmentTypeCommandHandler,
];
const QueriesHandler = [FindAllEquipmentTypesQueryHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: "EquipmentTypes", schema: EquipmentTypesSchema },
    ]),
  ],
  providers: [EquipmentTypesService, ...QueriesHandler, ...CommandHandlers],
  exports: [EquipmentTypesService],
  controllers: [EquipmentTypesController],
})
export class EquipmentTypesModule {}
