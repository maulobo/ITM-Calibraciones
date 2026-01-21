import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { IBrand } from '../interfaces/brand.interface';

export class UpdateBrandCommand implements ICommand {
  constructor(
    public readonly updateBrandDto: UpdateBrandDto,
  ) {}
}

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandCommandHandler implements ICommandHandler<UpdateBrandCommand> {
  constructor(
    @InjectModel('Brand') private readonly brandModel: Model<IBrand>,
  ) {}

  async execute(command: UpdateBrandCommand): Promise<any> {
    const { updateBrandDto } = command;
    const { id } = updateBrandDto
    
    return await this.brandModel.findOneAndUpdate(
        id,
        updateBrandDto, 
      { upsert: true, new: true });
  }
}
