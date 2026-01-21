import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AddEquipmentCardDTO } from './dto/add-equipment-card.dto';
import { EquipmentCardsService } from './equipment-card.service';
import { IEquipmentCards } from './interfaces/equipment-card.interface';
  
  @Auth()              
  @Controller('equipment-cards')
  export class EquipmentCardsController {
    constructor(
      private equipmentCardsService: EquipmentCardsService,
    ) {}

    
    @Post("/add")
    async addClient(
      @Body() addEquipmentCardDTO: AddEquipmentCardDTO,
    ): Promise<IEquipmentCards> {
      return await this.equipmentCardsService.addClient(addEquipmentCardDTO);
    }

    
    @Get("/all")
    async getAllClients(): Promise<IEquipmentCards[]> {
      return await this.equipmentCardsService.getAllClients();
    }
  
    
  }
  