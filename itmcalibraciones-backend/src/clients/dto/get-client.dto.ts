import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { QueryDTO } from "src/common/dto/query.dto";
import { AddOrUpdateClientDTO } from "./add-update-client.dto";

class ClientFilterDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetClientDTO extends IntersectionType(
  PartialType(AddOrUpdateClientDTO),
  IntersectionType(QueryDTO, ClientFilterDTO),
) {}
