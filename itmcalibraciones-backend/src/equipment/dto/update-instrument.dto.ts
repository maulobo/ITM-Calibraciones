import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { AddEquipmentDTO } from "./add-equipment.dto";

export class UpdateInstrumentDTO extends IntersectionType(
    PartialType(AddEquipmentDTO)
  ) {
    @IsMongoId()
    @IsNotEmpty()
    id: Types.ObjectId
  }