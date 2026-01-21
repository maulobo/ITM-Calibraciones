import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IState } from '../interfaces/state.interface';

export class FindAllStatesQuery implements IQuery {
  constructor() {}
}

@QueryHandler(FindAllStatesQuery)
export class FindAllStatesQueryHandler implements IQueryHandler<FindAllStatesQuery> {
  constructor(@InjectModel('State') private readonly stateModel: Model<IState[]>) {}

  public async execute(query: FindAllStatesQuery) {
    return this.stateModel.find().exec();
  }
}
