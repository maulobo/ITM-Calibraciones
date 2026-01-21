import {
    Body,
    Controller, Get, Post, Query
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertToObjectId } from 'src/common/utils/common-functions';
import { ClientService } from './clients.service';
import { AddOrUpdateClientDTO } from './dto/add-update-client.dto';
import { GetClientDTO } from './dto/get-client.dto';
import { IClient } from './interfaces/client.interface';
  
              
@Controller('clients')
@Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  export class ClientController {
    constructor(
      private clientService: ClientService,
    ) {}

    @Post("/add-or-update")
    async addClient(
      @Body() addClientDTO: AddOrUpdateClientDTO,
    ): Promise<IClient> {
      addClientDTO.city = new Types.ObjectId(addClientDTO.city)
      addClientDTO.id = new Types.ObjectId(addClientDTO.id)
      return await this.clientService.addClient(addClientDTO);
    }

    @Get("/all")
    async getAllClients(
      @Query() params: GetClientDTO,
    ): Promise<IClient[]> {
      return await this.clientService.getAllClients( convertToObjectId(params) );
    }
  
    
  }
  