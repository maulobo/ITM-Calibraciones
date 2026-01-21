import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryDTO } from 'src/common/dto/query.dto';
import { AddOrUpdateClientDTO } from './add-update-client.dto';
  
export class GetClientDTO extends IntersectionType(
  PartialType(AddOrUpdateClientDTO),
  QueryDTO,
) {}
