import { IntersectionType, PartialType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { QueryDTO } from 'src/common/dto/query.dto';

export class CityParamsDTO {
  @IsNotEmpty()
  @IsMongoId()
  state: Types.ObjectId;
}

export class AddCityDTO extends  CityParamsDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class AddStateDTO{
  @IsNotEmpty()
  @IsString()
  nombre: string;
}

export class FindCityDTO extends IntersectionType(
  PartialType(AddCityDTO),
  QueryDTO,
) {}
