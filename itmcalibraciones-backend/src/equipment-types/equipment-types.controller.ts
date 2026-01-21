import {
  Body,
  Controller, Get, Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/role.enum';
import { AddEquipmentTypesDTO } from './dto/add-equipment-types.dto';
import { EquipmentTypesService } from './equipment-types.service';
import { IEquipmentTypes } from './interfaces/equipment-types.interface';
  
              
  @Controller('equipment-types')
  export class EquipmentTypesController {
    constructor(
      private equipmentTypesService: EquipmentTypesService,
    ) {}

    @Auth()
    @Post("/")
    async addTypes(
      @Body() addEquipmentTypesDTO: AddEquipmentTypesDTO,
    ): Promise<IEquipmentTypes> {
      return await this.equipmentTypesService.addEquipmentType(addEquipmentTypesDTO);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Get("/")
    async getAllTypes(): Promise<IEquipmentTypes[]> {
      return await this.equipmentTypesService.getAllEquipmentTypes();
    }
  
    
  }
  