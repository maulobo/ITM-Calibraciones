import {
  Body,
  Controller, Get, Post, Put, Query
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertToObjectId } from 'src/common/utils/common-functions';
import { BadgetService } from './badgets.service';
import { AddBadgetDTO } from './dto/add-badgets.dto';
import { GetBadgetsDTO } from './dto/get-badgets.dto';
import { UpdateBadgetDto } from './dto/update-badgets.dto';
import { IBadget } from './interfaces/badgets.interface';
  
              
  @Auth()
  @Controller('badgets')
  export class BadgetController {
    constructor(
      private badgetService: BadgetService,
    ) {}

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/")
    async addBadget(
      @Body() addBadgetDTO: AddBadgetDTO,
    ): Promise<IBadget> {
      
      addBadgetDTO = convertToObjectId(addBadgetDTO)

      try{
        return await this.badgetService.addBadget(addBadgetDTO);
      }catch(e){
        console.log(e)
      }
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Put("/")
    async updateBadget(
      @Body() updateBadgetDto: UpdateBadgetDto,
    ): Promise<IBadget> {
      
      updateBadgetDto = convertToObjectId(updateBadgetDto)

      try{
        return await this.badgetService.updateBadget(updateBadgetDto);
      }catch(e){
        console.log(e)
      }
      
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Get("/")
    async getBadgets(
      @Query() getBadgetsDTO:GetBadgetsDTO,
      @User() user: JwtPayload,
    ): Promise<IBadget[]> {
      getBadgetsDTO = convertToObjectId(getBadgetsDTO)
      return await this.badgetService.getAllBadgets(getBadgetsDTO);
    
  }
  

  }
  