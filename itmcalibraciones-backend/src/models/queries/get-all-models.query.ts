import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QueryBuilder, QueryOptions } from "src/common/utils/queryClass";
import { GetModelsDTO } from "../dto/get-model.dto";
import { IModel } from "../interfaces/model.interface";

export class FindAllModelsQuery implements IQuery {
  constructor(
    public params: GetModelsDTO,
    public options: QueryOptions<IModel> = {},
  ) {}
}

@QueryHandler(FindAllModelsQuery)
export class FindAllModelsQueryHandler
  implements IQueryHandler<FindAllModelsQuery>
{
  constructor(
    @InjectModel("Model") private readonly modelModel: Model<IModel>,
  ) {}

  public async execute(query: FindAllModelsQuery) {
    const { params, options } = query;
    // Extraer paginación y otros campos de QueryDTO
    const { limit, offset, populate, select, ...find } = params;

    const queryBuilder = new QueryBuilder<IModel>(this.modelModel, options)
      .find(find)
      .select(select)
      .populate(populate || ["brand", "equipmentType"]); // Default populate if not provided

    if (limit) {
      queryBuilder.limit(Number(limit));
    }
    if (offset) {
      queryBuilder.offset(Number(offset));
    }

    return queryBuilder.exec();
  }
}
