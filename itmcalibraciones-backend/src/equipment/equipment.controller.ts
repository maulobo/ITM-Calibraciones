import {
  Body,
  Controller, Get,
  Param,
  Patch,
  Post, Query, Res
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import { basename } from 'path';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertMongoId, convertToObjectId, isAdminOrTechnical } from 'src/common/utils/common-functions';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { AddEquipmentDTO } from './dto/add-equipment.dto';
import { GetInstrumentsDTO } from './dto/get-instruments.dto';
import { UpdateInstrumentReceivedDTO } from './dto/update-instrument-received.dto';
import { UpdateInstrumentDTO } from './dto/update-instrument.dto';
import { EquipmentService } from './equipment.service';
import { IEquipment } from './interfaces/equipment.interface';
  
              
  @Controller('equipments')
  export class EquipmentController {
    constructor(
      private equipmentService: EquipmentService,
    ) {}

    @Auth()
    @Post("/")
    async addInstrument(
      @Body() addEquipmentDTO: AddEquipmentDTO,
    ): Promise<IEquipment> {
      addEquipmentDTO = convertToObjectId(addEquipmentDTO)
      
      if(addEquipmentDTO.id){
        const updateInstrument:UpdateInstrumentDTO = {...addEquipmentDTO, id: addEquipmentDTO.id}
        return await this.equipmentService.updateInstrument(updateInstrument);  
      }
      
      return await this.equipmentService.addEquipment(addEquipmentDTO);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Get("/notify-instrument-soon-wxpired")
    async notifyInstrumentSoonExpired(): Promise<void> {
      return await this.equipmentService.notifyInstrumentSoonExpired();
    }

    @Auth()
    @Patch("/")
    async patchInstrument(
      @Body() updateInstrumentDTO: UpdateInstrumentDTO,
      @User() user: JwtPayload,
    ): Promise<IEquipment> {
      updateInstrumentDTO = convertToObjectId(updateInstrumentDTO)
      const { isAdmin, isTechnical } = isAdminOrTechnical(user)
      if( !isAdmin && !isTechnical){
        const instrument = await this.equipmentService.getAllEquipments({_id: updateInstrumentDTO.id})
        if( this.equipmentService.instrumentUserAccess(user, instrument[0]) ){
          const { label, customSerialNumber, id } = updateInstrumentDTO
          return await this.equipmentService.updateInstrument({ label, customSerialNumber, id });
        }else{
          return throwException(StatusEnum.INSTRUMENT_NOT_BELONG_TO_USER)
        }
      }
      
      return await this.equipmentService.updateInstrument(updateInstrumentDTO);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Patch("/received")
    async patchInstrumentReceivedStatus(
      @Body() updateInstrumentReceivedDTO: UpdateInstrumentReceivedDTO,
    ): Promise<IEquipment> {
      updateInstrumentReceivedDTO = convertToObjectId(updateInstrumentReceivedDTO)
      return await this.equipmentService.updateInstrumentReceivedStatus(updateInstrumentReceivedDTO);
    }

    @Auth()
    @Get("/")
    async getInstrument(
      @Query() params: GetInstrumentsDTO,
      @User() user: JwtPayload,
    ): Promise<IEquipment[]> {
      
      const { isAdmin, isTechnical } = isAdminOrTechnical(user)
      const query = convertToObjectId(params)
      
      const instrumentes = await this.equipmentService.getAllEquipments(query);
      
      if(isAdmin || isTechnical) return instrumentes
      
      return await this.equipmentService.cleanInstrumentUserAccess(user,instrumentes)
    }

    @Get("/qr/:id")
    async getCertificateFromQR(
      @Param() param: GetInstrumentsDTO,
      @Res() res: Response
    ): Promise<void> {
      const { id } = param
      const instrumentId = convertMongoId(id);
      const instruments = await this.equipmentService.getAllEquipments({ _id: instrumentId });
      const certificateURL = instruments[0].certificate;

      try {
        // Make a GET request to the S3 URL using Axios
        const response: AxiosResponse<Buffer> = await axios.get(certificateURL, {
          responseType: 'arraybuffer',
        });

        const certificateFileName = basename(certificateURL);

        // Set the appropriate headers for the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${certificateFileName}"`);

        // Send the PDF file as the response
        res.send(response.data);
      } catch (error) {
        // Handle error if the request to S3 fails
        res.status(500).send('Failed to retrieve the certificate');
      }
    }
  }
  