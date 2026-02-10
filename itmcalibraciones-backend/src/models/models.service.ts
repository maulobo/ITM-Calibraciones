import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddModelCommand } from "./commands/add-model.command";
import { UpdateModelCommand } from "./commands/update-model.command";
import { AddModelDTO } from "./dto/add-model.dto";
import { GetModelsDTO } from "./dto/get-model.dto";
import { UpdateModelDTO } from "./dto/update-model.dto";
import { IModel } from "./interfaces/model.interface";
import { FindAllModelsQuery } from "./queries/get-all-models.query";

@Injectable()
export class ModelService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectModel("Model") private readonly modelModel: Model<IModel>,
  ) {}

  async addModel(addModelDTO: AddModelDTO) {
    return this.commandBus.execute(new AddModelCommand(addModelDTO));
  }

  async getAllModels(query: GetModelsDTO = {} as GetModelsDTO) {
    return this.queryBus.execute(new FindAllModelsQuery(query));
  }

  async updateModel(updateModelDTO: UpdateModelDTO) {
    return this.commandBus.execute(new UpdateModelCommand(updateModelDTO));
  }

  async deleteModel(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const result = await this.modelModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
