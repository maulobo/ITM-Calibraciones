import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUrl,
} from "class-validator";
import { StandardStatus } from "../schemas/standard-equipment.schema";

export class CreateStandardEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  brand: string;

  @IsMongoId()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  range: string;

  @IsOptional()
  @IsString()
  calibrationProvider?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsUrl()
  certificate?: string;

  @IsOptional()
  @IsDateString()
  calibrationDate?: string;

  @IsOptional()
  @IsDateString()
  calibrationExpirationDate?: string;

  @IsOptional()
  @IsEnum(StandardStatus)
  status?: StandardStatus;

  @IsOptional()
  @IsString()
  location?: string;
}
