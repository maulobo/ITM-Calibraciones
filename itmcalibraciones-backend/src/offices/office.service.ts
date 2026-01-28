import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddOfficeCommand } from "./commands/add-or-update-office.command";
import { AddOfficeDTO } from "./dto/add-office.dto";
import { GetAllOfficesDTO } from "./dto/get-all-offices.dto";
import { IOffice } from "./interfaces/office.interface";
import { FindAllOfficesQuery } from "./queries/get-all-offices.query";

@Injectable()
export class OfficeService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectModel("Office") private readonly officeModel: Model<IOffice>,
  ) {}

  async addOffice(addOfficeDTO: AddOfficeDTO) {
    return this.commandBus.execute(new AddOfficeCommand(addOfficeDTO));
  }

  async getAllOffices(query: GetAllOfficesDTO) {
    return this.queryBus.execute(new FindAllOfficesQuery(query));
  }

  async deleteOffice(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const result = await this.officeModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
