import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddEquipmentTypeCommand } from "./commands/add-equipment-types.command";
import { UpdateEquipmentTypeCommand } from "./commands/update-equipment-types.command";
import { AddEquipmentTypesDTO } from "./dto/add-equipment-types.dto";
import { IEquipmentTypes } from "./interfaces/equipment-types.interface";
import { FindAllEquipmentTypesQuery } from "./queries/get-all-equipment-types.query";

@Injectable()
export class EquipmentTypesService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectModel("EquipmentTypes")
    private readonly equipmentTypesModel: Model<IEquipmentTypes>,
  ) {}

  async addEquipmentType(addEquipmentTypesDTO: AddEquipmentTypesDTO) {
    return this.commandBus.execute(
      new AddEquipmentTypeCommand(addEquipmentTypesDTO),
    );
  }

  async getAllEquipmentTypes() {
    return this.queryBus.execute(new FindAllEquipmentTypesQuery());
  }

  async updateEquipmentType(addEquipmentTypesDTO: AddEquipmentTypesDTO) {
    return this.commandBus.execute(
      new UpdateEquipmentTypeCommand(addEquipmentTypesDTO),
    );
  }

  async deleteEquipmentType(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const result = await this.equipmentTypesModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
