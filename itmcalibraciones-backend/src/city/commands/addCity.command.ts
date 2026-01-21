import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddCityDTO } from '../dto/city.dto';
import { ICity } from '../interfaces/city.interface';


export class AddCityCommand implements ICommand {
  constructor(
    public addCityDTO: AddCityDTO,
  ) {}
}

@CommandHandler(AddCityCommand)
export class AddCityCommandHandler implements ICommandHandler<AddCityCommand> {
  constructor(
    @InjectModel('City') private readonly cityModel: Model<ICity>,
  ) {}

  async execute(command: AddCityCommand): Promise<any> {
    const { addCityDTO } = command;
    addCityDTO.state = new Types.ObjectId(addCityDTO.state)

    return await this.cityModel.findOneAndUpdate(
      { name: addCityDTO.name },
        addCityDTO, 
      { upsert: true, new: true });
  }
}
