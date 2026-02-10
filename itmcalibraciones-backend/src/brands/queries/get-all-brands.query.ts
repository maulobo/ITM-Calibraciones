import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QueryBuilder, QueryOptions } from "src/common/utils/queryClass";
import { GetBrandsDTO } from "../dto/get-brands.dto";
import { IBrand } from "../interfaces/brand.interface";

export class FindAllBrandsQuery implements IQuery {
  constructor(
    public params: GetBrandsDTO = {},
    public options: QueryOptions<IBrand> = {},
  ) {}
}

@QueryHandler(FindAllBrandsQuery)
export class FindAllBrandsQueryHandler
  implements IQueryHandler<FindAllBrandsQuery>
{
  constructor(
    @InjectModel("Brand") private readonly brandModel: Model<IBrand>,
  ) {}

  public async execute(query: FindAllBrandsQuery) {
    const { params, options } = query;
    const { populate, select, limit, offset, ...find } = params;

    const queryBuilder = new QueryBuilder<IBrand>(this.brandModel, options)
      .find(find)
      .select(select)
      .populate(populate);

    if (limit) {
      queryBuilder.limit(Number(limit));
    }
    if (offset) {
      queryBuilder.offset(Number(offset));
    }

    return queryBuilder.exec();
  }
}
