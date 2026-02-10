import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { Types } from "mongoose";
import {
  EquipmentStateEnum,
  EquipmentTechnicalStateEnum,
  EquipmentLogisticStateEnum,
  EquipmentLocationEnum,
} from "../const.enum";

export class AddEquipmentDTO {
  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  id?: Types.ObjectId;

  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serialNumber: string;

  @IsOptional()
  @IsEnum(EquipmentTechnicalStateEnum)
  @ApiProperty({ enum: EquipmentTechnicalStateEnum })
  technicalState?: EquipmentTechnicalStateEnum;

  @IsOptional()
  @IsEnum(EquipmentLogisticStateEnum)
  @ApiProperty({ enum: EquipmentLogisticStateEnum })
  logisticState?: EquipmentLogisticStateEnum;

  @IsOptional()
  @IsEnum(EquipmentLocationEnum)
  @ApiProperty({ enum: EquipmentLocationEnum })
  location?: EquipmentLocationEnum;

  @IsString()
  @IsOptional()
  @ApiProperty()
  customSerialNumber?: string;
  @IsOptional()
  @IsMongoId({ each: true })
  @ApiProperty()
  usedStandards?: string[];
  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @IsOptional()
  @ApiProperty()
  range?: string;

  @IsOptional()
  @ApiProperty()
  @IsEnum(EquipmentStateEnum)
  state?: EquipmentStateEnum;

  @IsString()
  @IsOptional()
  @ApiProperty()
  calibrationDate?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty()
  calibrationExpirationDate?: Date;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  model: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  office: Types.ObjectId;

  @IsOptional()
  @ApiProperty()
  label?: string;

  @IsOptional()
  @ApiProperty()
  qr?: string;

  @IsOptional()
  @ApiProperty()
  datasheet?: string;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  outOfService?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmailNotification?: boolean;
}
