import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IBadget } from '../interfaces/badgets.interface';

export class ResetBadgetCounterCommand implements ICommand {
  constructor() {}
}

@CommandHandler(ResetBadgetCounterCommand)
export class ResetBadgetCounterCommandHandler implements ICommandHandler<ResetBadgetCounterCommand> {
  constructor(
    @InjectModel('Badget') private readonly badgetModel: Model<IBadget>,
  ) {}

  async execute(): Promise<void> {
    //@ts-ignore
    await this.badgetModel.counterReset('number', function(err) {
        // Now the counter is 0
        console.log("Count number of badget was restarted")
    });

  }
}
