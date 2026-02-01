import { PartialType } from "@nestjs/mapped-types";
import { CreateStandardEquipmentDto } from "./create-standard-equipment.dto";

export class UpdateStandardEquipmentDto extends PartialType(
  CreateStandardEquipmentDto,
) {}
