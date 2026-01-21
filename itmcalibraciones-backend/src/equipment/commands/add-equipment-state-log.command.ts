import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddEquipmentDTO } from '../dto/add-equipment.dto';
import { IEquipment } from '../interfaces/equipment.interface';

export class AddEquipmentCommand implements ICommand {
  constructor(
    public readonly addEquipmentDTO: AddEquipmentDTO,
  ) {}
}

@CommandHandler(AddEquipmentCommand)
export class AddEquipmentCommandHandler implements ICommandHandler<AddEquipmentCommand> {
  constructor(
    @InjectModel('Equipment') private readonly equipmentModel: Model<IEquipment>,
  ) {}

  async execute(command: AddEquipmentCommand): Promise<IEquipment> {
    const { addEquipmentDTO } = command;
    const newEquipment =  await new this.equipmentModel(addEquipmentDTO).save();
    return newEquipment.populate("instrumentType");
  }
}
