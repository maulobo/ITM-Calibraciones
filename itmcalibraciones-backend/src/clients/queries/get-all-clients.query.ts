import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QueryBuilder, QueryOptions } from "src/common/utils/queryClass";
import { GetClientDTO } from "../dto/get-client.dto";
import { IClient } from "../interfaces/client.interface";
export class FindAllClientsQuery implements IQuery {
  constructor(
    public params: GetClientDTO,
    public options: QueryOptions<IClient> = {},
  ) {}
}

@QueryHandler(FindAllClientsQuery)
export class FindAllClientsQueryHandler
  implements IQueryHandler<FindAllClientsQuery>
{
  constructor(
    @InjectModel("Client") private readonly clientModel: Model<IClient>,
  ) {}

  public async execute(query: FindAllClientsQuery) {
    const { params = {}, options } = query;
    const { populate, select, search, ...find } = params as any;

    // Support text search by Search Query
    const filter = { ...find };
    if (search) {
      filter.$or = [
        { socialReason: { $regex: search, $options: "i" } },
        { cuit: { $regex: search, $options: "i" } },
        {
          contacts: { $elemMatch: { name: { $regex: search, $options: "i" } } },
        }, // Search inside contacts array
      ];
    }

    const queryBuilder = new QueryBuilder<IClient>(this.clientModel, options)
      .find(filter)
      .select(select)
      .populate(populate);

    return queryBuilder.exec();
  }
}
