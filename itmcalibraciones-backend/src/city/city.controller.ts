import {
    Body,
    Controller, Get, Param, Post
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/role.enum';
import { CityService } from './city.service';
import { AddCityDTO, AddStateDTO, CityParamsDTO } from './dto/city.dto';
import { ICity } from './interfaces/city.interface';
import { IState } from './interfaces/state.interface';
  
              
  @Controller('city')
  export class CityController {
    constructor(
      private cityService: CityService,
    ) {}

    @Auth()
    @Get("/all-states")
    async getAllOffices(): Promise<IState[]> {
      return await this.cityService.getAllStates();
    }

    @Auth()
    @Get("/state/:state")
    async getAllCitiesByState(
      @Param() params: CityParamsDTO
      ): Promise<ICity[]> {
      params.state = new Types.ObjectId(params.state)
      return await this.cityService.getCitiesByState(params);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/state")
    async addState(
      @Body() addStateDTO: AddStateDTO,
    ): Promise<ICity> {
      try{
        return await this.cityService.addState(addStateDTO);
      }catch(e){
        console.log(e)
      }
      
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/")
    async addCity(
      @Body() addCityDTO: AddCityDTO,
    ): Promise<ICity> {
      try{
        return await this.cityService.addCity(addCityDTO);
      }catch(e){
        console.log(e)
      }
      
    }
  
    
  }
  