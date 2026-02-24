import { IntersectionType } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { QueryDTO } from "src/common/dto/query.dto";

export class GetOfficesFilterDTO {
  @IsOptional()
  @IsMongoId()
  client?: Types.ObjectId;

  @IsOptional()
  @IsString()
  search?: string;
}

export class GetAllOfficesDTO extends IntersectionType(
  GetOfficesFilterDTO,
  QueryDTO,
) {}
