import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddTechnicalInformDTO } from '../dto/technical-inform.dto';
import { ITechnicalInforms } from '../interfaces/informs.interface';

export class AddInformCommand implements ICommand {
  constructor(
    public readonly addTechnicalInformDTO: AddTechnicalInformDTO,
  ) {}
}

@CommandHandler(AddInformCommand)
export class AddInformCommandHandler implements ICommandHandler<AddInformCommand> {
  constructor(
    @InjectModel('TechnicalInforms') private readonly informModel: Model<ITechnicalInforms>,
  ) {}

  async execute(command: AddInformCommand): Promise<ITechnicalInforms> {
    const { addTechnicalInformDTO } = command;
    const { id } = addTechnicalInformDTO
    
    if(!id){
      const newInform =  await new this.informModel(addTechnicalInformDTO).save();
      return newInform.populate('equipment')
    }

    const updateInform =  await this.informModel.findOneAndUpdate(
        id,
        addTechnicalInformDTO, 
      { upsert: true, new: true });
      return updateInform.populate('equipment')
    
  }
}
