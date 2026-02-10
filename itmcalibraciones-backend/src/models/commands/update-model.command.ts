import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateModelDTO } from "../dto/update-model.dto";
import { IModel } from "../interfaces/model.interface";

export class UpdateModelCommand implements ICommand {
  constructor(public readonly updateModelDTO: UpdateModelDTO) {}
}

@CommandHandler(UpdateModelCommand)
export class UpdateModelCommandHandler
  implements ICommandHandler<UpdateModelCommand>
{
  constructor(
    @InjectModel("Model") private readonly modelModel: Model<IModel>,
  ) {}

  async execute(command: UpdateModelCommand): Promise<any> {
    const { updateModelDTO } = command;
    const { id, ...updateData } = updateModelDTO;

    return await this.modelModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}
