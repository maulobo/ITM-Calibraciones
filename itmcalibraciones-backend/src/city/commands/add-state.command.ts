import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddStateDTO } from '../dto/city.dto';
import { IState } from '../interfaces/state.interface';


export class AddStateCommand implements ICommand {
  constructor(
    public addStateDTO: AddStateDTO,
  ) {}
}

@CommandHandler(AddStateCommand)
export class AddStateCommandHandler implements ICommandHandler<AddStateCommand> {
  constructor(
    @InjectModel('State') private readonly stateModel: Model<IState>,
  ) {}

  async execute(command: AddStateCommand): Promise<any> {
    const { addStateDTO } = command;

    return await this.stateModel.findOneAndUpdate(
      { nombre: addStateDTO.nombre },
        addStateDTO, 
      { upsert: true, new: true });
  }
}
