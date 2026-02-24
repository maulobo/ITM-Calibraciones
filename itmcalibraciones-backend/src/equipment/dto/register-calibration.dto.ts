import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";

export class RegisterCalibrationDto {
  @IsDateString()
  calibrationDate: string;

  @IsDateString()
  calibrationExpirationDate: string;

  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  usedStandards?: string[];
}
