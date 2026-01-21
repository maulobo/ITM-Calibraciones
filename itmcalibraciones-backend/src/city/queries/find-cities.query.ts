import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder, QueryOptions } from 'src/common/utils/queryClass';
import { FindCityDTO } from '../dto/city.dto';
import { ICity } from '../interfaces/city.interface';

export class FindCitiesQuery implements IQuery {
  constructor(
    public params: FindCityDTO,
    public options: QueryOptions<ICity> = {}
    ) {}
}

@QueryHandler(FindCitiesQuery)
export class FindCitiesQueryHandler implements IQueryHandler<FindCitiesQuery> {
  constructor(@InjectModel('City') private readonly cityModel: Model<ICity>) {}

  public async execute(query: FindCitiesQuery) {
    const { params, options } = query;
    const { populate, select, ...find } = params;
    const partialEquipment: Partial<ICity> = find

    const queryBuilder = new QueryBuilder<ICity>(this.cityModel, options)
      .find(partialEquipment)
      .select(params.select)
      .populate(params.populate);

    return queryBuilder.exec();
  }
}
