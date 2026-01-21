import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AddBadgetDTO } from '../dto/add-badgets.dto';
import { IBadget } from '../interfaces/badgets.interface';

export class AddBadgetCommand implements ICommand {
  constructor(
    public readonly addBadgetDTO: AddBadgetDTO,
  ) {}
}

@CommandHandler(AddBadgetCommand)
export class AddBadgetCommandHandler implements ICommandHandler<AddBadgetCommand> {
  constructor(
    @InjectModel('Badget') private readonly badgetModel: Model<IBadget>,
  ) {}

  async execute(command: AddBadgetCommand): Promise<any> {
    const { addBadgetDTO } = command;
    return await new this.badgetModel(addBadgetDTO).save();
  }
}
