import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CityParamsDTO } from '../dto/city.dto';
import { ICity } from '../interfaces/city.interface';


export class FindCitiesByStateQuery implements IQuery {
  constructor(public params: CityParamsDTO) {}
}

@QueryHandler(FindCitiesByStateQuery)
export class FindCitiesByStateQueryHandler implements IQueryHandler<FindCitiesByStateQuery> {
  constructor(@InjectModel('City') private readonly cityModel: Model<ICity>) {}

  public async execute(query: FindCitiesByStateQuery): Promise<ICity[]> {
    const { state } = query.params;
    return await this.cityModel.find({ state }).exec();
  }
}
