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
    const { filter = {} } = query;
    const { populate, select, limit, offset, search, client, ...find } =
      filter as any;

    const mongoFilter: any = { ...find, isActive: { $ne: false } };

    if (client) {
      // 🛠️ FIX: Busca tanto por ObjectId como por String por si la DB tiene datos mezclados
      mongoFilter["$or"] = [{ client: client }, { client: client.toString() }];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchFilter = {
        $or: [
          { name: searchRegex },
          { adress: searchRegex },
          { phoneNumber: searchRegex },
          { responsable: searchRegex },
        ],
      };

      // Si ya existe un $or (por el client), combinamos con $and
      if (mongoFilter["$or"]) {
        const previousOr = mongoFilter["$or"];
        delete mongoFilter["$or"];
        mongoFilter["$and"] = [{ $or: previousOr }, searchFilter];
      } else {
        mongoFilter["$or"] = searchFilter["$or"];
      }
    }

    const queryBuilder = this.officeModel
      .find(mongoFilter)
      .populate("city")
      .populate("client");

    if (limit) queryBuilder.limit(Number(limit));
    if (offset) queryBuilder.skip(Number(offset));
    if (select) queryBuilder.select(select);

    return queryBuilder.exec();
  }
}
