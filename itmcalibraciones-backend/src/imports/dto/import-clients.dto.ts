import { IntersectionType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';
import { AddOrUpdateClientDTO } from 'src/clients/dto/add-update-client.dto';
  
  export class ImportClientsDTO {  
    
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImportClientDTO)
    clients: ImportClientDTO[];
}

export class ImportClientDTO extends IntersectionType(
  PartialType(AddOrUpdateClientDTO)
) {}
