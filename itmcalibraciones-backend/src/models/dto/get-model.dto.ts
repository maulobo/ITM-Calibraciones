import { IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class GetModelsDTO {
  @IsOptional()
  @IsMongoId()
  brand?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  equipmentType?: Types.ObjectId;
}
