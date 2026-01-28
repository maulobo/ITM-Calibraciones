import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UserRoles } from "src/common/enums/role.enum";
import { AddEquipmentTypesDTO } from "./dto/add-equipment-types.dto";
import { EquipmentTypesService } from "./equipment-types.service";
import { IEquipmentTypes } from "./interfaces/equipment-types.interface";

@Controller("equipment-types")
export class EquipmentTypesController {
  constructor(private equipmentTypesService: EquipmentTypesService) {}

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Post("/")
  async addTypes(
    @Body() addEquipmentTypesDTO: AddEquipmentTypesDTO,
  ): Promise<IEquipmentTypes> {
    return await this.equipmentTypesService.addEquipmentType(
      addEquipmentTypesDTO,
    );
  }

  @Auth()
  @Get("/")
  async getAllTypes(): Promise<IEquipmentTypes[]> {
    return await this.equipmentTypesService.getAllEquipmentTypes();
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Put("/:id")
  async updateType(
    @Param("id") id: string,
    @Body() addEquipmentTypesDTO: AddEquipmentTypesDTO,
  ): Promise<IEquipmentTypes> {
    addEquipmentTypesDTO.id = new Types.ObjectId(id);
    return await this.equipmentTypesService.updateEquipmentType(
      addEquipmentTypesDTO,
    );
  }

  @Auth(UserRoles.ADMIN)
  @Delete("/:id")
  async deleteType(@Param("id") id: string): Promise<{ deleted: boolean }> {
    return await this.equipmentTypesService.deleteEquipmentType(
      new Types.ObjectId(id),
    );
  }
}
