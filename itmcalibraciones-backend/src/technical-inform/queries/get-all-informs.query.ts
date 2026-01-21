import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder, QueryOptions } from 'src/common/utils/queryClass';
import { GetInformDTO } from '../dto/get-inform.dto';
import { ITechnicalInforms } from '../interfaces/informs.interface';

export class FindInformsQuery implements IQuery {
  constructor(
    public params: GetInformDTO,
    public options: QueryOptions<ITechnicalInforms> = {}
  ) {}
}

@QueryHandler(FindInformsQuery)
export class FindInformsQueryyHandler implements IQueryHandler<FindInformsQuery> {
  constructor(@InjectModel('TechnicalInforms') private readonly informsModel: Model<ITechnicalInforms>) {}

  public async execute(query: FindInformsQuery) {
    const { params, options } = query;
    const { populate, select, ...find } = params;
    // @ts-ignore
    const partial: Partial<ITechnicalInforms> = find
    const queryBuilder = new QueryBuilder<ITechnicalInforms>(this.informsModel, options)
      .find(partial)
      .select(params.select)
      .populate(params.populate);

    return queryBuilder.exec();
  }
}
