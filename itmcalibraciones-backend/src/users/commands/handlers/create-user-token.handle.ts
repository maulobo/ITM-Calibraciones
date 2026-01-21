import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserTokenSource } from 'src/users/enum/token-source.enum';
import { IUserToken } from 'src/users/interfaces/user-token.interface';
import { v4 as uuidv4 } from 'uuid';

export class CreateUserTokenCommand implements ICommand {
    constructor(
        public readonly userId: Types.ObjectId,
        public readonly source: UserTokenSource
    ) {}
}

@CommandHandler(CreateUserTokenCommand)
export class CreateUserTokenHandler implements ICommandHandler<CreateUserTokenCommand> {
  constructor(@InjectModel('UserToken') private readonly userTokenModel: Model<IUserToken>) {}

  async execute(command: CreateUserTokenCommand): Promise<IUserToken> {
    const { userId, source } = command;
    const token = uuidv4()
    const newToken = {
        user: new Types.ObjectId(userId),
        token,
        source,
        used: false
      }
  
      return await new this.userTokenModel(newToken).save();
    
  }
}
