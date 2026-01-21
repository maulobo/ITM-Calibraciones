import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryDTO } from 'src/common/dto/query.dto';
import { AddCertificateDTO } from './certificate.dto';

export class GetCertificateDTO extends IntersectionType(
    PartialType(AddCertificateDTO),
    QueryDTO,
) {}
  
