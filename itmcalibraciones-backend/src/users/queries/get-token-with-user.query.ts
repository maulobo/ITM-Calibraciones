import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IUserToken } from '../interfaces/user-token.interface';
import { IUser } from '../interfaces/user.interface';

export class GetTokenWithUserQuery implements IQuery {
  constructor(public readonly token: string) {}
}

@QueryHandler(GetTokenWithUserQuery)
export class GetTokenWithUserHandler
  implements IQueryHandler<GetTokenWithUserQuery>
{
  constructor(@InjectModel('UserToken') private readonly tokenModel: Model<IUserToken>) {}

  async execute(query: GetTokenWithUserQuery): Promise<IUser> {
    const { token } = query;
    return await this.tokenModel.findOne({token}).populate("user").lean();
  }
}
