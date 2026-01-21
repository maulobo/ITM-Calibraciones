import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddBrandDTO } from '../dto/add-brand.dto';
import { IBrand } from '../interfaces/brand.interface';

export class AddBrandCommand implements ICommand {
  constructor(
    public readonly addBrandDTO: AddBrandDTO,
  ) {}
}

@CommandHandler(AddBrandCommand)
export class AddBrandCommandHandler implements ICommandHandler<AddBrandCommand> {
  constructor(
    @InjectModel('Brand') private readonly brandModel: Model<IBrand>,
  ) {}

  async execute(command: AddBrandCommand): Promise<any> {
    const { addBrandDTO } = command;
    return await new this.brandModel(addBrandDTO).save();
  }
}
