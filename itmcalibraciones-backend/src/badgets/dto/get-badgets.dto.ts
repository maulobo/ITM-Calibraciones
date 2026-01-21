import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryDTO } from 'src/common/dto/query.dto';
import { AddBadgetDTO } from './add-badgets.dto';

export class GetBadgetsDTO extends IntersectionType(
    PartialType(AddBadgetDTO),
    QueryDTO,
) {}
  
