import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddEquipmentTypesDTO } from "../dto/add-equipment-types.dto";
import { IEquipmentTypes } from "../interfaces/equipment-types.interface";

export class UpdateEquipmentTypeCommand implements ICommand {
  constructor(public readonly addEquipmentTypesDTO: AddEquipmentTypesDTO) {}
}

@CommandHandler(UpdateEquipmentTypeCommand)
export class UpdateEquipmentTypeCommandHandler
  implements ICommandHandler<UpdateEquipmentTypeCommand>
{
  constructor(
    @InjectModel("EquipmentTypes")
    private readonly equipmentTypesModel: Model<IEquipmentTypes>,
  ) {}

  async execute(command: UpdateEquipmentTypeCommand): Promise<any> {
    const { addEquipmentTypesDTO } = command;
    const { id, ...updateData } = addEquipmentTypesDTO;

    return await this.equipmentTypesModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}
