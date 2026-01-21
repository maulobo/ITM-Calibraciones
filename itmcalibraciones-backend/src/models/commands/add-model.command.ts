import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddModelDTO } from '../dto/add-model.dto';
import { IModel } from '../interfaces/model.interface';

export class AddModelCommand implements ICommand {
  constructor(
    public readonly addModelDTO: AddModelDTO,
  ) {}
}

@CommandHandler(AddModelCommand)
export class AddModelCommandHandler implements ICommandHandler<AddModelCommand> {
  constructor(
    @InjectModel('Model') private readonly modelModel: Model<IModel>,
  ) {}

  async execute(command: AddModelCommand): Promise<any> {
    const { addModelDTO } = command;
    return await new this.modelModel(addModelDTO).save();
  }
}
