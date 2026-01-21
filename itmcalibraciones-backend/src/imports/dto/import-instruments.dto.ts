import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested
} from 'class-validator';
import { AddEquipmentDTO } from 'src/equipment/dto/add-equipment.dto';
  
  export class ImportInstrumentsDTO {  
    
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImportInstrumentDTO)
    instruments: ImportInstrumentDTO[];
}

export class ImportInstrumentDTO extends IntersectionType(
  PartialType(AddEquipmentDTO),
) {
      @IsString()
      @IsNotEmpty()
      @ApiProperty()
      brandName: string;

      @Transform(({ value }) => String(value))
      @Transform(({ value }) => value === '' ? 'N/A' : value)
      @IsString()
      @ApiProperty()
      modelName: string;

      @IsString()
      @IsNotEmpty()
      @ApiProperty()
      instrumentTypeName: string;

      @IsString()
      @IsNotEmpty()
      @ApiProperty()
      officeName: string;

      @IsString()
      @IsNotEmpty()
      @ApiProperty()
      clientName: string;

      
     
}
