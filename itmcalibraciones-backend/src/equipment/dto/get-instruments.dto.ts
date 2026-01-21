import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryDTO } from 'src/common/dto/query.dto';
import { InstrumentsDTO } from './instrument.dto';
  
export class GetInstrumentsDTO extends IntersectionType(
  PartialType(InstrumentsDTO),
  QueryDTO,
) {}
