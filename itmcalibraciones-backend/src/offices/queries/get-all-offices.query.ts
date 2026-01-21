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
    if (query.filter && query.filter.client) {
      Object.assign(filter, { client: query.filter.client });
    }
    return this.officeModel.find(filter).populate("city").exec();
  }
}
