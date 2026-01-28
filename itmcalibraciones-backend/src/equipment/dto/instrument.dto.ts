import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class InstrumentsDTO {
  @IsMongoId()
  @ApiProperty()
  id: Types.ObjectId;

  @IsMongoId()
  @ApiProperty()
  _id: Types.ObjectId;

  @IsString()
  @ApiProperty()
  serialNumber: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  customSerialNumber: string;

  @IsString()
  @ApiProperty()
  range: string;

  @IsString()
  @ApiProperty()
  calibrationDate: Date;

  @IsString()
  @ApiProperty()
  calibrationExpirationDate: Date;

  @IsMongoId()
  @ApiProperty()
  model: Types.ObjectId;

  @IsMongoId()
  @ApiProperty()
  office: Types.ObjectId;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  outOfService?: boolean;
}
