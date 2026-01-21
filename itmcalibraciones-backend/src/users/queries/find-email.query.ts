import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

export class FindUserByEmailQuery implements IQuery {
  constructor(public email: string) {}
}

@QueryHandler(FindUserByEmailQuery)
export class FindUserByEmail implements IQueryHandler<FindUserByEmailQuery> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  public async execute(query: FindUserByEmailQuery) {
    const filter = { email: query.email };
    return this.userModel.findOne(filter).exec();
  }
}
