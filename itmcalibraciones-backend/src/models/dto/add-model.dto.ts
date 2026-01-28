import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class AddModelDTO {
  @IsOptional()
  @IsMongoId()
  id?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  brand: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  equipmentType: Types.ObjectId;
}
