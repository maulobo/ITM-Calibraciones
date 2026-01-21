import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryDTO } from 'src/common/dto/query.dto';
import { AddTechnicalInformDTO } from './technical-inform.dto';

export class GetInformDTO extends IntersectionType(
    PartialType(AddTechnicalInformDTO),
    QueryDTO,
) {}
  
