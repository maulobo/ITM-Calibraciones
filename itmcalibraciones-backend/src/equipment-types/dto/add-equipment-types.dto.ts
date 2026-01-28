import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class AddEquipmentTypesDTO {
  @IsOptional()
  @IsMongoId()
  id?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;
}
