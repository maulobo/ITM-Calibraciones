import { IntersectionType, PartialType } from "@nestjs/swagger";
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";
import { Type } from "class-transformer";
import { AddEquipmentDTO } from "./add-equipment.dto";
import { ExternalProviderDto } from "./external-provider.dto";

export class UpdateInstrumentDTO extends IntersectionType(
  PartialType(AddEquipmentDTO),
) {
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId;

  @IsOptional()
  @IsDateString()
  retireDate?: Date;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  remittanceNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExternalProviderDto)
  externalProvider?: ExternalProviderDto;
}
