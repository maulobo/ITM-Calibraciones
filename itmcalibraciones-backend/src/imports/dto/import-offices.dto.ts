import { IntersectionType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { AddOfficeDTO } from 'src/offices/dto/add-office.dto';
  
  export class ImportOfficesDTO {  
    
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImportClientDTO)
    offices: ImportClientDTO[];
}

export class ImportClientDTO extends IntersectionType(
  PartialType(AddOfficeDTO),
) {
      @IsString()
      @IsOptional()
      socialReason?: string;

      @IsString()
      @IsOptional()
      cityName?: string;

     
}
