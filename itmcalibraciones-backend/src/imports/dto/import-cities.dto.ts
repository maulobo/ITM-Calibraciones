import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';


export class ImportCityDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  stateName: string;

  @IsMongoId()
  @IsOptional()
  state: Types.ObjectId;
  
}

export class ImportCitiesDTO {
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImportCityDTO)
    cities: ImportCityDTO[];
}