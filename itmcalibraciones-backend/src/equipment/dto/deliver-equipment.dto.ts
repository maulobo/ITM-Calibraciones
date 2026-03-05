import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeliverEquipmentDto {
  @IsString()
  @IsNotEmpty()
  deliveredTo: string;

  @IsDateString()
  @IsOptional()
  retireDate?: string;

  @IsString()
  @IsOptional()
  remittanceNumber?: string;

  @IsString()
  @IsOptional()
  certificateNumber?: string;
}
