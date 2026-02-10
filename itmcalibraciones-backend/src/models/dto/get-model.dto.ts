import { IntersectionType } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { QueryDTO } from "src/common/dto/query.dto";

class GetModelsFilterDTO {
  @IsOptional()
  @IsMongoId()
  brand?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  equipmentType?: Types.ObjectId;

  @IsOptional()
  name?: string;
}

export class GetModelsDTO extends IntersectionType(
  GetModelsFilterDTO,
  QueryDTO,
) {}
