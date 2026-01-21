import {
  Body,
  Controller, Get, Post, Query
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { convertMongoId } from 'src/common/utils/common-functions';
import { AddModelDTO } from './dto/add-model.dto';
import { GetModelsDTO } from './dto/get-model.dto';
import { IModel } from './interfaces/model.interface';
import { ModelService } from './models.service';
  
              
  @Controller('models')
  export class ModelController {
    constructor(
      private modelService: ModelService,
    ) {}

    @Auth()
    @Post("/")
    async addModel(
      @Body() addModelDTO: AddModelDTO,
    ): Promise<IModel> {
      addModelDTO.brand = convertMongoId(addModelDTO.brand)
      return await this.modelService.addModel(addModelDTO);
    }

    @Auth()
    @Get("/")
    async getAllBrands(
      @Query() query: GetModelsDTO
    ): Promise<IModel[]> {
      if(query && query.brand) query.brand = convertMongoId(query.brand)
      return await this.modelService.getAllModels(query);
      
    }

  
    
  }
  