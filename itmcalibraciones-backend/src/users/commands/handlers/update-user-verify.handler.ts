import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/users/interfaces/user.interface';

export class UpdateUserVerifyStatusCommand implements ICommand {
    constructor(
        public readonly email: string
    ) {}
}

@CommandHandler(UpdateUserVerifyStatusCommand)
export class UpdateUserVerifyStatusHandler implements ICommandHandler<UpdateUserVerifyStatusCommand> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(command: UpdateUserVerifyStatusCommand): Promise<IUser> {
    const { email } = command;
    const user = await this.userModel.findOneAndUpdate(
      {email: email },
      {
        emailConfirmed: true,
      },
      { new: true },
    );

    return user;
    
  }
}
