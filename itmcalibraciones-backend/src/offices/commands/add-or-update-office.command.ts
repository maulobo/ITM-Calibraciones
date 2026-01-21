import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddOfficeDTO } from '../dto/add-office.dto';
import { IOffice } from '../interfaces/office.interface';

export class AddOfficeCommand implements ICommand {
  constructor(
    public readonly addOfficeDTO: AddOfficeDTO,
  ) {}
}

@CommandHandler(AddOfficeCommand)
export class AddOfficeCommandHandler implements ICommandHandler<AddOfficeCommand> {
  constructor(
    @InjectModel('Office') private readonly officeModel: Model<IOffice>,
  ) {}

  async execute(command: AddOfficeCommand): Promise<any> {
    const { addOfficeDTO } = command;
    
    if(addOfficeDTO.id) return await this.officeModel.findOneAndUpdate(
      {_id: addOfficeDTO.id},
      addOfficeDTO, 
      { upsert: true, new: true });
    
    return await new this.officeModel(addOfficeDTO).save();
  }
}
