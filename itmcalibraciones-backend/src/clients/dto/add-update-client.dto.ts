import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class AddOrUpdateClientDTO {
  @IsOptional()
  @IsMongoId()
  @ApiProperty()
  id?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  socialReason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cuit: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  responsable: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  city: Types.ObjectId;

  @IsString()
  @IsOptional()
  @ApiProperty()
  cityName?: string;

  @IsString()
  @ApiProperty()
  state?: Types.ObjectId;
}
