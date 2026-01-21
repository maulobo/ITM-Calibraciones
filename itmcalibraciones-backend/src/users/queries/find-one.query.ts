import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from '../interfaces/user.interface';


export class FindOneUserQuery implements IQuery {
  constructor(public readonly id: Types.ObjectId) {}
}

@QueryHandler(FindOneUserQuery)
export class FindOneUserQueryHandler
  implements IQueryHandler<FindOneUserQuery>
{
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(query: FindOneUserQuery): Promise<IUser> {
    const { id } = query;
    const user = await this.userModel.findById(id);

    return user;
  }
}
