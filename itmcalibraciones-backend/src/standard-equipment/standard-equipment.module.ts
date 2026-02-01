import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StandardEquipmentService } from "./standard-equipment.service";
import { StandardEquipmentController } from "./standard-equipment.controller";
import { StandardEquipmentSchema } from "./schemas/standard-equipment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "StandardEquipment", schema: StandardEquipmentSchema },
    ]),
  ],
  controllers: [StandardEquipmentController],
  providers: [StandardEquipmentService],
  exports: [StandardEquipmentService],
})
export class StandardEquipmentModule {}
