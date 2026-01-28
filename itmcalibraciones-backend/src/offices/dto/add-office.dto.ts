import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class AddOfficeDTO {
  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  id?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  client?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  responsable?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  adress?: string;

  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  cityName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  stateName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;
}
