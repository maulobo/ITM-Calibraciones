import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GetAllOfficesDTO } from "../dto/get-all-offices.dto";
import { IOffice } from "../interfaces/office.interface";

export class FindAllOfficesQuery implements IQuery {
  constructor(public filter?: GetAllOfficesDTO) {}
}

@QueryHandler(FindAllOfficesQuery)
export class FindAllOfficesQueryHandler
  implements IQueryHandler<FindAllOfficesQuery>
{
  constructor(
    @InjectModel("Office") private readonly officeModel: Model<IOffice>,
  ) {}

  public async execute(query: FindAllOfficesQuery) {
    const filter = {};
    if (query.filter?.client) {
      // 🛠️ FIX: Busca tanto por ObjectId como por String por si la DB tiene datos mezclados
      const clientId = query.filter.client;
      filter["$or"] = [{ client: clientId }, { client: clientId.toString() }];
    }
    return this.officeModel
      .find(filter)
      .populate("city")
      .populate("client")
      .exec();
  }
}
