import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateUserProfileDTO } from 'src/users/dto/update-user-profile.dto';
import { IUser } from 'src/users/interfaces/user.interface';

export class UpdateUserProfileCommand implements ICommand {
    constructor(
        public readonly userId: Types.ObjectId,
        public readonly updateProfile: UpdateUserProfileDTO,

    ) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(command: UpdateUserProfileCommand): Promise<IUser> {
    const { userId, updateProfile  } = command;
    const { name, lastName, phoneNumber } = updateProfile
    const user = await this.userModel.findOneAndUpdate(
      {_id: userId },
      {
        name, lastName, phoneNumber
      },
      { new: true },
    );

    return user;
    
  }
}
