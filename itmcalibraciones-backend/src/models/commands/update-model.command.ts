import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddModelDTO } from "../dto/add-model.dto";
import { IModel } from "../interfaces/model.interface";

export class UpdateModelCommand implements ICommand {
  constructor(public readonly addModelDTO: AddModelDTO) {}
}

@CommandHandler(UpdateModelCommand)
export class UpdateModelCommandHandler
  implements ICommandHandler<UpdateModelCommand>
{
  constructor(
    @InjectModel("Model") private readonly modelModel: Model<IModel>,
  ) {}

  async execute(command: UpdateModelCommand): Promise<any> {
    const { addModelDTO } = command;
    const { id, ...updateData } = addModelDTO;

    return await this.modelModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}
