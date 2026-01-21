import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from 'src/users/interfaces/user.interface';

export class UpdateUserLastLoginCommand implements ICommand {
    constructor(
        public readonly userId: Types.ObjectId,
    ) {}
}

@CommandHandler(UpdateUserLastLoginCommand)
export class UpdateUserLastLoginHandler implements ICommandHandler<UpdateUserLastLoginCommand> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(command: UpdateUserLastLoginCommand): Promise<IUser> {
    const { userId  } = command;
    const user = await this.userModel.findOneAndUpdate(
      {_id: userId },
      {
        lastLogin: new Date()
      },
      { new: true },
    );

    return user;
    
  }
}
