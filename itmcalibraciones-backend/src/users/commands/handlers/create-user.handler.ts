import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { IUser } from 'src/users/interfaces/user.interface';
import { CreateUserCommand } from '../impl/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async execute(command: CreateUserCommand): Promise<IUser> {
    const { userDto } = command;

    const userExists = await this.userModel.findOne({ email: userDto.email });

    if (userExists) {
      throwException(StatusEnum.USER_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    const userCreated = await new this.userModel({
      ...userDto,
      password: hashedPassword,
    });

    return userCreated.save();
  }
}
