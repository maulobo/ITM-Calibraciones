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
  Req,
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
  async uploadDatasheet(@Param("id") id: string, @Req() req: any) {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      throw new BadRequestException(
        "El archivo debe ser enviado como multipart/form-data",
      );
    }

    // Subir a R2 usando el servicio (delegamos el streaming directo a multer-s3)
    // El servicio espera el request completo para procesarlo
    const url = await this.imageUploadService.uploadDatasheet(req);

    if (!url) {
      throw new BadRequestException(
        "Error al subir el archivo, no se generó URL",
      );
    }

    // Actualizar el modelo con la URL
    const updateDTO = new UpdateModelDTO();
    updateDTO.id = new Types.ObjectId(id);
    updateDTO.datasheet = url;

    return await this.modelService.updateModel(updateDTO);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Delete("/:id/datasheet-remove")
  async deleteDatasheet(@Param("id") id: string) {
    // 1. Obtener el modelo para saber la URL del archivo
    const model = await this.modelService.getModelById(id);
    if (!model || !model.datasheet) {
      throw new BadRequestException("El modelo no tiene datasheet o no existe");
    }

    // 2. Eliminar de R2 Cloudflare
    await this.imageUploadService.deleteFileR2(model.datasheet);

    // 3. Actualizar base de datos (poner datasheet a null o string vacío)
    const updateDTO = new UpdateModelDTO();
    updateDTO.id = new Types.ObjectId(id);
    updateDTO.datasheet = null; // Mongoose update should handle null if schema allows, or use empty string

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
