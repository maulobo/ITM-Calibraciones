import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { CurrencyENUM } from 'src/common/enums/currency.enum';
import { BadgetTypeENUM } from '../enum/type.enum';
import { VatENUM } from '../enum/vat.enum';

class BudgetDetailDto {
  itemNumber: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;
}

export class AddBadgetDTO {
  
  @ApiProperty({ type: [String] }) // Esto indica que "types" es un arreglo de strings en la documentación
  @IsNotEmpty()
  @IsString({ each: true }) // Verifica que cada elemento del arreglo sea una cadena
  @IsEnum(BadgetTypeENUM, { each: true }) // Verifica que cada cadena esté en el enum
  @ArrayUnique() // Verifica que los elementos del arreglo sean únicos
  types: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  office: Types.ObjectId; 

  @ApiProperty()
  @IsString()
  @IsOptional()
  user?: Types.ObjectId; 

  @ApiProperty()
  @IsString()
  @IsOptional()
  advisor?: Types.ObjectId; 

  @ApiProperty()
  @IsString()
  attention?: string;

  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty()
  @IsString()
  reference?: string;

  @ApiProperty()
  @IsString()
  deliveryTime: string;

  @ApiProperty()
  @IsNumber()
  offerValidity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paymentTerms: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(CurrencyENUM)
  currency: CurrencyENUM;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(VatENUM)
  vat: VatENUM;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  showTotal?: boolean;

  @ApiProperty()
  @IsArray()
  selectedNotes?: string[]

  @ApiProperty()
  @IsArray()
  instrumentsRelated?: string[]

  @ApiProperty({ type: [BudgetDetailDto] }) // Add type annotation
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetDetailDto) // Add this decorator from class-transformer
  details: BudgetDetailDto[];
}
