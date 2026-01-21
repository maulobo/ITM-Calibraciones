import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddEquipmentTypesDTO } from '../dto/add-equipment-types.dto';
import { IEquipmentTypes } from '../interfaces/equipment-types.interface';

export class AddEquipmentTypeCommand implements ICommand {
  constructor(
    public readonly addEquipmentTypesDTO: AddEquipmentTypesDTO,
  ) {}
}

@CommandHandler(AddEquipmentTypeCommand)
export class AddEquipmentTypeCommandHandler implements ICommandHandler<AddEquipmentTypeCommand> {
  constructor(
    @InjectModel('EquipmentTypes') private readonly equipmentTypesModel: Model<IEquipmentTypes>,
  ) {}

  async execute(command: AddEquipmentTypeCommand): Promise<any> {
    const { addEquipmentTypesDTO } = command;
    return await new this.equipmentTypesModel(addEquipmentTypesDTO).save();
  }
}
