import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateInstrumentDTO } from '../dto/update-instrument.dto';
import { IEquipment } from '../interfaces/equipment.interface';

export class UpdateInstrumentCommand implements ICommand {
  constructor(
    public readonly updateInstrumentDTO: UpdateInstrumentDTO,
  ) {}
}

@CommandHandler(UpdateInstrumentCommand)
export class UpdateInstrumentCommandHandler implements ICommandHandler<UpdateInstrumentCommand> {
  constructor(
    @InjectModel('Equipment') private readonly instrumentModel: Model<IEquipment>,
  ) {}

  async execute(command: UpdateInstrumentCommand): Promise<IEquipment> {
    const { updateInstrumentDTO } = command;
    const { id } = updateInstrumentDTO

    if(!id) return await new this.instrumentModel(updateInstrumentDTO).save();

    return await this.instrumentModel.findOneAndUpdate(
        id,
        updateInstrumentDTO, 
      { upsert: true, new: true });
    
  }
}
