import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QueryBuilder, QueryOptions } from "src/common/utils/queryClass";
import { FindUserDTO } from "../dto/find-user.dto";
import { IUser } from "../interfaces/user.interface";

export class FindUserQuery implements IQuery {
  constructor(
    public params: FindUserDTO,
    public options: QueryOptions<IUser> = {},
  ) {}
}

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler<FindUserQuery> {
  constructor(@InjectModel("User") private readonly userModel: Model<IUser>) {}

  public async execute(query: FindUserQuery): Promise<IUser[]> {
    const { params, options } = query;
    const { populate, select, limit, offset, ...find } = params;
    const partialUser: Partial<IUser> = find; // Now find does NOT contain limit/offset

    // Convert text numbers to real numbers if coming from query params
    const limitNum = limit ? Number(limit) : undefined;
    const offsetNum = offset ? Number(offset) : undefined;

    const queryBuilder = new QueryBuilder<IUser>(this.userModel, options)
      .find(partialUser)
      .select(params.select)
      .populate(params.populate);

    if (limitNum) queryBuilder.limit(limitNum);
    if (offsetNum) queryBuilder.offset(offsetNum);

    return queryBuilder.exec();
  }
}
