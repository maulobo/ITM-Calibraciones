import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder } from 'src/common/utils/queryClass';
import { IUser } from '../interfaces/user.interface';

export class FindAdminTechUserQuery implements IQuery {
  constructor() {}
}

@QueryHandler(FindAdminTechUserQuery)
export class FindAdminTechUserQueryHandler implements IQueryHandler<FindAdminTechUserQuery> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  public async execute(query: FindAdminTechUserQuery): Promise<IUser[]> {
    
    return await new QueryBuilder<IUser>(this.userModel)
        .where("roles", "in", ["ADMIN", "Technical"])
        .select(["roles","id","lastName","name"])
        .exec();
  }
}
