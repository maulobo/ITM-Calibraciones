import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserToken } from 'src/users/interfaces/user-token.interface';

export class UpdateUserTokenCommand implements ICommand {
    constructor(
        public readonly id: Types.ObjectId,
        public readonly status: boolean,
    ) {}
}

@CommandHandler(UpdateUserTokenCommand)
export class UpdateUserTokenHandler implements ICommandHandler<UpdateUserTokenCommand> {
  constructor(@InjectModel('UserToken') private readonly userTokenModel: Model<IUserToken>) {}

  async execute(command: UpdateUserTokenCommand): Promise<IUserToken> {
    const { id , status} = command;
    const token = await this.userTokenModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(id)},
      {
        used: status,
      },
      { new: true },
    );

    return token;
    
  }
}
