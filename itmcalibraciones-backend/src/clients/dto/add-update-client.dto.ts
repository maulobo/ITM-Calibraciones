import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";

class ContactDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  role?: string;
}

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
  @IsOptional()
  @ApiProperty()
  adress?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  city?: Types.ObjectId;

  @IsString()
  @IsOptional()
  @ApiProperty()
  cityName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  state?: Types.ObjectId;

  @IsString()
  @IsOptional()
  @ApiProperty()
  stateName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  @IsOptional()
  @ApiProperty({ type: [ContactDTO] })
  contacts?: ContactDTO[];
}
