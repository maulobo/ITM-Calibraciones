import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateBadgetDto } from '../dto/update-badgets.dto';
import { IBadget } from '../interfaces/badgets.interface';


export class UpdateBadgetCommand implements ICommand {
  constructor(
    public readonly updateBadgetDto: UpdateBadgetDto,
  ) {}
}

@CommandHandler(UpdateBadgetCommand)
export class UpdateBadgetCommandHandler implements ICommandHandler<UpdateBadgetCommand> {
  constructor(
    @InjectModel('Badget') private readonly badgetModel: Model<IBadget>,
  ) {}

  async execute(command: UpdateBadgetCommand): Promise<any> {
    const { updateBadgetDto } = command;
    const { id } = updateBadgetDto
    
    return await this.badgetModel.findOneAndUpdate(
        id,
        updateBadgetDto, 
      { upsert: true, new: true });
  }
}
