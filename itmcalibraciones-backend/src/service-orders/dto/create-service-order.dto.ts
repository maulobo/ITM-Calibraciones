import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class EquipmentItemDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string; // ObjectId

  @IsString()
  @IsNotEmpty()
  instrumentType: string; // ObjectId

  @IsString()
  @IsOptional()
  range?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Assuming office is handled by backend based on user or explicit if needed.
  // Adding it just in case, but optional.
  @IsString()
  @IsOptional()
  office?: string;
}

export class CreateServiceOrderDto {
  @IsString()
  @IsNotEmpty()
  client: string; // ObjectId

  @IsObject()
  @Type(() => ContactDto)
  contact: ContactDto;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsArray()
  @Type(() => EquipmentItemDto)
  items: EquipmentItemDto[];

  @IsString()
  @IsOptional()
  observations?: string;
}
