import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { generate } from 'generate-password';
import { Model } from 'mongoose';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { IUser } from 'src/users/interfaces/user.interface';

export class RefreshUserPasswordCommand implements ICommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RefreshUserPasswordCommand)
export class RefreshUserPasswordHandler implements ICommandHandler<RefreshUserPasswordCommand> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>
  ) {}

  async execute(command: RefreshUserPasswordCommand): Promise<string> {
    const { email } = command;

    const userExists = await this.userModel.findOne({ email });

    if (!userExists) {
      throwException(StatusEnum.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt();

    const newPassword = generate({
      length: 10,
      numbers: true
    });
    
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(
      {_id: userExists._id},
      {
        password: hashedPassword,
      },
      { new: true },
    );
    
    return newPassword
  }
}
