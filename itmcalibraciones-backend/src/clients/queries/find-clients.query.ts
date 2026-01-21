import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IClient } from '../interfaces/client.interface';

export class FindClientsQuery implements IQuery {
  constructor(public email: string) {}
}

@QueryHandler(FindClientsQuery)
export class FindClientsQueryHandler implements IQueryHandler<FindClientsQuery> {
  constructor(@InjectModel('Client') private readonly clientModel: Model<IClient>) {}

  public async execute(query: FindClientsQuery) {
    const filter = { email: query.email };
    return this.clientModel.find(filter).exec();
  }
}
