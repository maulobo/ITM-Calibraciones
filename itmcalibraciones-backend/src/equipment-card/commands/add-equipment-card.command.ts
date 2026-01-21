import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AddEquipmentCardDTO } from '../dto/add-equipment-card.dto';
import { IEquipmentCards } from '../interfaces/equipment-card.interface';

export class AddEquipmentCardCommand implements ICommand {
  constructor(
    public readonly addEquipmentCardDTO: AddEquipmentCardDTO,
  ) {}
}

@CommandHandler(AddEquipmentCardCommand)
export class AddEquipmentCardCommandHandler implements ICommandHandler<AddEquipmentCardCommand> {
  constructor(
    @InjectModel('EquipmentCards') private readonly equipmentCardsModel: Model<IEquipmentCards>,
  ) {}

  async execute(command: AddEquipmentCardCommand): Promise<IEquipmentCards> {
    const { addEquipmentCardDTO } = command;
    
    return await this.equipmentCardsModel.findOneAndUpdate(
      addEquipmentCardDTO, 
      { upsert: true, new: true });
  }
}
