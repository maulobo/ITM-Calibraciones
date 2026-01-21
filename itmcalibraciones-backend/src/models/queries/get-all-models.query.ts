import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetModelsDTO } from '../dto/get-model.dto';
import { IModel } from '../interfaces/model.interface';

export class FindAllModelsQuery implements IQuery {
  constructor(
    public filter:GetModelsDTO
  ) {}
}

@QueryHandler(FindAllModelsQuery)
export class FindAllModelsQueryHandler implements IQueryHandler<FindAllModelsQuery> {
  constructor(@InjectModel('Model') private readonly modelModel: Model<IModel>) {}

  public async execute(query: FindAllModelsQuery) {
    const { brand } = query.filter
    return this.modelModel.find( {brand} ).populate("brand").exec();
  }
}
