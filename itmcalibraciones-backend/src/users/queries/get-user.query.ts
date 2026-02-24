import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { QueryOptions } from "src/common/utils/queryClass";
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
    const { params } = query;
    const { populate, select, limit, offset, match, office, client, ...rest } =
      params as any;

    const limitNum = limit ? Number(limit) : undefined;
    const offsetNum = offset ? Number(offset) : undefined;

    const mongoFilter: Record<string, any> = {};

    // Add simple filter fields (name, email, roles, etc.) excluding undefined values
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null) {
        mongoFilter[key] = value;
      }
    }

    // Handle office with $or to support both ObjectId and String stored in DB
    if (office) {
      const conditions: any[] = [{ office: office }];
      try {
        conditions.push({ office: new Types.ObjectId(String(office)) });
      } catch {}
      mongoFilter["$and"] = [
        ...(mongoFilter["$and"] || []),
        { $or: conditions },
      ];
    }

    // Handle client with $or to support both ObjectId and String stored in DB
    if (client) {
      const conditions: any[] = [{ client: client }];
      try {
        conditions.push({ client: new Types.ObjectId(String(client)) });
      } catch {}
      mongoFilter["$and"] = [
        ...(mongoFilter["$and"] || []),
        { $or: conditions },
      ];
    }

    // Always populate client so frontend can display client name
    let q = this.userModel.find(mongoFilter).populate("client");

    if (match?.field && match?.searchText) {
      q = q.find({
        [match.field]: { $regex: match.searchText, $options: "i" },
      });
    }

    if (populate) {
      const pops = Array.isArray(populate) ? populate : [populate];
      pops.forEach((p: string) => {
        q = (q as any).populate(p);
      });
    }

    if (select) {
      const sel = Array.isArray(select) ? select : [select];
      q = q.select(sel.join(" "));
    }

    if (limitNum) q = q.limit(limitNum);
    if (offsetNum) q = q.skip(offsetNum);

    return q.exec() as any;
  }
}
