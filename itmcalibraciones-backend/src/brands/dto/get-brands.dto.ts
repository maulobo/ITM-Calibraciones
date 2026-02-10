import { IntersectionType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { QueryDTO } from "src/common/dto/query.dto";

class GetBrandsFilterDTO {
  @IsOptional()
  @IsString()
  name?: string;
}

export class GetBrandsDTO extends IntersectionType(
  GetBrandsFilterDTO,
  QueryDTO,
) {}
