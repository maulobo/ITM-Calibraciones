import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDTO } from 'src/users/dto/update-user.dto';
import { IUser } from 'src/users/interfaces/user.interface';

export class UpdateUserCommand implements ICommand {
    constructor(
        public readonly updateUser: UpdateUserDTO,
    
    ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(command: UpdateUserCommand): Promise<IUser> {
    const { updateUser } = command;
    const user = await this.userModel.findByIdAndUpdate(
        updateUser.id,
        updateUser,
      { new: true },
    );

    return user;
    
  }
}
