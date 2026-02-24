import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// DTO para el Contacto (snapshot)
export class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;
}

// DTO para los Equipos que vienen en la lista
export class EquipmentItemDto {
  @IsString()
  @IsOptional()
  brand?: string; // ID de Marca (no requerido, el modelo ya contiene la marca)

  @IsString()
  @IsNotEmpty()
  model: string; // ID de Modelo o Texto

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsOptional()
  range?: string;

  @IsString()
  @IsOptional()
  tag?: string; // TAG del cliente

  @IsString()
  @IsOptional()
  observations?: string; // Observaciones al ingreso del equipo
}

export class CreateServiceOrderDto {
  // CLIENTE (obligatorio)
  @IsString()
  @IsNotEmpty()
  client: string;

  // OFICINA (obligatorio ahora)
  @IsString()
  @IsNotEmpty()
  office: string;

  // CONTACTOS (snapshot array - múltiples personas que traen los equipos)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];

  // LISTA DE EQUIPOS
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentItemDto)
  items: EquipmentItemDto[];

  // EXTRAS
  @IsString()
  @IsOptional()
  observations?: string;

  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;
}
