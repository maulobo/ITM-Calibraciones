import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder } from 'src/common/utils/queryClass';

import { GetBadgetsDTO } from '../dto/get-badgets.dto';
import { IBadget } from '../interfaces/badgets.interface';

export class FindAllBadgetsQuery implements IQuery {
  constructor(
    public params: GetBadgetsDTO,
    ) {}
}

@QueryHandler(FindAllBadgetsQuery)
export class FindAllBadgetsQueryHandler implements IQueryHandler<FindAllBadgetsQuery> {
  constructor(@InjectModel('Badget') private readonly badgetModel: Model<IBadget>) {}

  public async execute(query: FindAllBadgetsQuery) {
    const { params } = query;
    const { populate, select, limit, offset, match, ...find } = params;
    // @ts-ignore
    const partial: Partial<IBadget> = find
    const queryBuilder = new QueryBuilder<IBadget>(this.badgetModel)
      .find(partial)
      .select(params.select)
      .populate(params.populate);

    if(match){
      queryBuilder.match(match);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset); // Convierte offset a número
    }
      
      
    return queryBuilder.exec();
  }
}
