import {
  Body,
  Controller, Get,
  Post, Query, Req, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertMongoId, convertToObjectId, isAdminOrTechnical } from 'src/common/utils/common-functions';
import { EquipmentService } from 'src/equipment/equipment.service';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { multerOptions } from 'src/image-upload/multer-options';
import { CertificateService } from './certificate.service';
import { AddCertificateDTO } from './dto/certificate.dto';
import { DeleteCertificateDTO } from './dto/delete-certificate.dto';
import { GetCertificateDTO } from './dto/get-certificate.dto';
import { ICertificate } from './interfaces/certificate.interface';
  @Controller('certificate')
  export class CertificateController {
    constructor(
      private certificateService: CertificateService,
      private equipmentService: EquipmentService,
    ) {}

    @Post('/delete')
    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    async deleteCertificate(
      @Body() deleteCertificateDTO: DeleteCertificateDTO,
    ) {
      deleteCertificateDTO = convertToObjectId(deleteCertificateDTO)
      return await this.certificateService.deleteCertificate(deleteCertificateDTO)      
    }

    @Post('/')
    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async addCertificateWithWaterMark(
      @UploadedFile() file: Express.Multer.File,
      @Body() addCertificateDTO: AddCertificateDTO,
    ) {
      addCertificateDTO = convertToObjectId(addCertificateDTO)
      return await this.certificateService.addCertificateWithWaterMark(addCertificateDTO, file)      
    }

    
  

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/off")
    async addCertificate(
      @Req() request, 
      @Query() addCertificateDTO: AddCertificateDTO
    ): Promise<AddCertificateDTO> {
      addCertificateDTO = convertToObjectId(addCertificateDTO)
      return await this.certificateService.addCertificate(addCertificateDTO, request)
    }

    @Auth()  
    @Get("/")
    async getCertificate(
      @Query() getCertificateDTO:GetCertificateDTO,
      @User() user: JwtPayload,
    ): Promise<ICertificate[]> {
      getCertificateDTO = convertToObjectId(getCertificateDTO)
      const { isAdmin, isTechnical } = isAdminOrTechnical(user)
      if( !isAdmin && !isTechnical){
        const equipment = convertMongoId(getCertificateDTO.equipment)
        const instrument = await this.equipmentService.getAllEquipments({_id:equipment})
        if( this.equipmentService.instrumentUserAccess(user, instrument[0]) ){
          return await this.certificateService.getCertificate(getCertificateDTO);
        }else{
          return throwException(StatusEnum.INSTRUMENT_NOT_BELONG_TO_USER)
        }
      }
      return await this.certificateService.getCertificate(getCertificateDTO);
    }
  }
