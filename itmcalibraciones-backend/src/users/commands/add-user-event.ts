import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from '../interfaces/user.interface';


export class AddUserEventCommand implements ICommand {
  constructor(
      public readonly eventId: Types.ObjectId,
      public readonly userId: Types.ObjectId
    ) {}
}

@CommandHandler(AddUserEventCommand)
export class AddUserEventHandler implements ICommandHandler<AddUserEventCommand> {
  constructor(
    @InjectModel('User') private readonly IUser: Model<IUser>,
  ) {}

  async execute(command: AddUserEventCommand): Promise<IUser> {
    const { userId } = command;

    const user = await this.IUser.findByIdAndUpdate(
      { _id: userId }, 
      { new: true },
    );

    return user;
  }
}
