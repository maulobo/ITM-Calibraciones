import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UserRoles } from "src/common/enums/role.enum";
import { convertMongoId } from "src/common/utils/common-functions";
import { AddModelDTO } from "./dto/add-model.dto";
import { GetModelsDTO } from "./dto/get-model.dto";
import { IModel } from "./interfaces/model.interface";
import { ModelService } from "./models.service";

@Controller("models")
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Post("/")
  async addModel(@Body() addModelDTO: AddModelDTO): Promise<IModel> {
    addModelDTO.brand = convertMongoId(addModelDTO.brand);
    addModelDTO.equipmentType = convertMongoId(addModelDTO.equipmentType);
    return await this.modelService.addModel(addModelDTO);
  }

  @Auth()
  @Get("/")
  async getAllModels(@Query() query: GetModelsDTO): Promise<IModel[]> {
    if (query && query.brand) query.brand = convertMongoId(query.brand);
    if (query && query.equipmentType)
      query.equipmentType = convertMongoId(query.equipmentType);
    return await this.modelService.getAllModels(query);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Put("/:id")
  async updateModel(
    @Param("id") id: string,
    @Body() addModelDTO: AddModelDTO,
  ): Promise<IModel> {
    addModelDTO.id = new Types.ObjectId(id);
    addModelDTO.brand = convertMongoId(addModelDTO.brand);
    addModelDTO.equipmentType = convertMongoId(addModelDTO.equipmentType);
    return await this.modelService.updateModel(addModelDTO);
  }

  @Auth(UserRoles.ADMIN)
  @Delete("/:id")
  async deleteModel(@Param("id") id: string): Promise<{ deleted: boolean }> {
    return await this.modelService.deleteModel(new Types.ObjectId(id));
  }
}
