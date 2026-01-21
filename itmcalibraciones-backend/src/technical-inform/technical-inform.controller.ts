import {
  Body,
  Controller, Get, Post, Query
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { convertMongoId, convertToObjectId } from 'src/common/utils/common-functions';
import { GetInformDTO } from './dto/get-inform.dto';
import { AddTechnicalInformDTO } from './dto/technical-inform.dto';
import { ITechnicalInforms } from './interfaces/informs.interface';
import { TechnicalInformService } from './technical-inform.service';
  
  @Auth()  
  @Controller('technical-inform')
  export class TechnicalInformController {
    constructor(
      private TechnicalInformService: TechnicalInformService,
    ) {}

    
    @Post("/")
    async addInform(
      @Body() addTechnicalInformDTO: AddTechnicalInformDTO,
      @User() user: JwtPayload,
    ): Promise<ITechnicalInforms> {
      addTechnicalInformDTO.user = convertMongoId(user.id)
      addTechnicalInformDTO = convertToObjectId(addTechnicalInformDTO)
      return await this.TechnicalInformService.addInform(addTechnicalInformDTO);
    }

    
    @Get("/")
    async getAllInforms(
      @Query() getInformDTO:GetInformDTO
    ): Promise<ITechnicalInforms[]> {
      getInformDTO = convertToObjectId(getInformDTO)
      return await this.TechnicalInformService.getInforms(getInformDTO);
    }
  }
  