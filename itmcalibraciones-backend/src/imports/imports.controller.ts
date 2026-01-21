import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/role.enum';
import { ImportCitiesDTO } from './dto/import-cities.dto';
import { ImportClientsDTO } from './dto/import-clients.dto';
import { ImportInstrumentsDTO } from './dto/import-instruments.dto';
import { ImportOfficesDTO } from './dto/import-offices.dto';
import { ImportsService } from './imports.service';
  
              
  @Controller('imports')

  export class ImportsController {
    constructor(
      private importsService: ImportsService,
    ) {}

    @Auth(UserRoles.ADMIN)
    @Post("/cities")
    async importCities(
      @Body() importCitiesDTO: ImportCitiesDTO,
    ): Promise<void[]> {
      return await this.importsService.importCities(importCitiesDTO)
    }

    @Auth(UserRoles.ADMIN)
    @Post("/clients")
    async importClients(
      @Body() importClientsDTO: ImportClientsDTO,
    ): Promise<void[]> {
      return await this.importsService.importClients(importClientsDTO);
    }

    @Auth(UserRoles.ADMIN)
    @Post("/offices")
    async importOffice(
      @Body() importOfficesDTO: ImportOfficesDTO,
    ): Promise<void[]> {
      return await this.importsService.importOffice(importOfficesDTO);
    }

    @Auth(UserRoles.ADMIN)
    @Post("/instruments")
    async importInstruments(
      @Body() importInstrumentsDTO: ImportInstrumentsDTO,
    ): Promise<void[]> {
      return await this.importsService.importInstruments(importInstrumentsDTO);
    }

  }
  