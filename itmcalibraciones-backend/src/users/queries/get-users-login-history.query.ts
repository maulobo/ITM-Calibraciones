import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserLoginHistory } from '../interfaces/user-login-history.interface';
import { IUser } from '../interfaces/user.interface';

export class GetUsersLoginHistoryQuery implements IQuery {
  constructor(public readonly userId: Types.ObjectId) {}
}

@QueryHandler(GetUsersLoginHistoryQuery)
export class GetUsersLoginHistoryHandler
  implements IQueryHandler<GetUsersLoginHistoryQuery>
{
  constructor(@InjectModel('UserLoginHistory') private readonly userLoginHistoryModel: Model<IUserLoginHistory>) {}

  async execute(query: GetUsersLoginHistoryQuery): Promise<IUser[]> {
    const { userId } = query;
    return await this.userLoginHistoryModel.find({userId: new Types.ObjectId(userId)} );
  }
}
