import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UserRoles } from "src/common/enums/role.enum";
import { convertMongoId } from "src/common/utils/common-functions";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { AddModelDTO } from "./dto/add-model.dto";
import { GetModelsDTO } from "./dto/get-model.dto";
import { UpdateModelDTO } from "./dto/update-model.dto";
import { IModel } from "./interfaces/model.interface";
import { ModelService } from "./models.service";

@Controller("models")
export class ModelController {
  constructor(
    private modelService: ModelService,
    private imageUploadService: ImageUploadService,
  ) {}

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

  @Auth()
  @Get("/:id")
  async getModelById(@Param("id") id: string): Promise<IModel> {
    const models = await this.modelService.getAllModels({
      _id: convertMongoId(id),
    } as GetModelsDTO);
    return models[0] || null;
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Post("/:id/datasheet-upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDatasheet(@Param("id") id: string, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("No se ha enviado ningún archivo");
    }

    const req = { files: [file] };
    // Subir a R2 usando el servicio
    const url = await this.imageUploadService.uploadDatasheet(req);

    // Actualizar el modelo con la URL
    const updateDTO = new UpdateModelDTO();
    updateDTO.id = new Types.ObjectId(id);
    updateDTO.datasheet = url;

    return await this.modelService.updateModel(updateDTO);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Put("/:id")
  async updateModel(
    @Param("id") id: string,
    @Body() updateModelDTO: UpdateModelDTO,
  ): Promise<IModel> {
    updateModelDTO.id = new Types.ObjectId(id);
    if (updateModelDTO.brand)
      updateModelDTO.brand = convertMongoId(updateModelDTO.brand);
    if (updateModelDTO.equipmentType)
      updateModelDTO.equipmentType = convertMongoId(
        updateModelDTO.equipmentType,
      );
    return await this.modelService.updateModel(updateModelDTO);
  }

  @Auth(UserRoles.ADMIN)
  @Delete("/:id")
  async deleteModel(@Param("id") id: string): Promise<{ deleted: boolean }> {
    return await this.modelService.deleteModel(new Types.ObjectId(id));
  }
}
