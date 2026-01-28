import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ServiceOrdersController } from "./service-orders.controller";
import { ServiceOrdersService } from "./service-orders.service";
import {
  ServiceOrderEntity,
  ServiceOrderSchema,
} from "./schemas/service-order.schema";
import {
  EquipmentEntity,
  EquipmentSchema,
} from "../equipment/schemas/equipment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "ServiceOrder", schema: ServiceOrderSchema },
      { name: "Equipment", schema: EquipmentSchema },
    ]),
  ],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}
