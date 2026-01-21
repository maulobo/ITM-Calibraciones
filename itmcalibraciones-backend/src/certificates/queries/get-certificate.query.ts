import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder, QueryOptions } from 'src/common/utils/queryClass';
import { GetCertificateDTO } from '../dto/get-certificate.dto';
import { ICertificate } from '../interfaces/certificate.interface';

export class FindCertificateQuery implements IQuery {
  constructor(
    public params: GetCertificateDTO,
    public options: QueryOptions<ICertificate> = {}
    ) {}
}

@QueryHandler(FindCertificateQuery)
export class FindCertificateHandler implements IQueryHandler<FindCertificateQuery> {
  constructor(@InjectModel('Certificate') private readonly certificateModel: Model<ICertificate>) {}

  public async execute(query: FindCertificateQuery) {
    const { params, options } = query;
    const { populate, select, ...find } = params;
    // @ts-ignore
    const partial: Partial<ICertificate> = find
    
    params.deleted = false || null || undefined
    find.deleted = false || null || undefined

    const queryBuilder = new QueryBuilder<ICertificate>(this.certificateModel, options)
      .find(partial)
      .select(params.select)
      .populate(params.populate);

    return queryBuilder.exec();
  }
}
