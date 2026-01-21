import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserLoginHistory } from '../interfaces/user-login-history.interface';

export class AddUserHistoryLoginCommand implements ICommand {
  constructor(
      public readonly userId: Types.ObjectId
    ) {}
}

@CommandHandler(AddUserHistoryLoginCommand)
export class AddUserHistoryLoginHandler implements ICommandHandler<AddUserHistoryLoginCommand> {
  constructor(
    @InjectModel('UserLoginHistory') private readonly userLoginHistoryModel: Model<IUserLoginHistory>,
  ) {}

  async execute(command: AddUserHistoryLoginCommand): Promise<IUserLoginHistory> {
    const { userId } = command;

    const historyCreated = await new this.userLoginHistoryModel({
      user: new Types.ObjectId(userId),
    });

    return historyCreated.save();

  }
}
