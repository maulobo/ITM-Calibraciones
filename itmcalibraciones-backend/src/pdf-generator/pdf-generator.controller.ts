import { Controller, Get, Param, Res } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { BadgetService } from 'src/badgets/badgets.service';
import { IBadget } from 'src/badgets/interfaces/badgets.interface';
import { IClient } from 'src/clients/interfaces/client.interface';
import { IdParamDTO } from 'src/common/dto/id-param.dto';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertMongoId, dateToEsString } from 'src/common/utils/common-functions';
import { IEquipmentTypes } from 'src/equipment-types/interfaces/equipment-types.interface';
import { EquipmentService } from 'src/equipment/equipment.service';
import { IEquipment } from 'src/equipment/interfaces/equipment.interface';
import { IModel } from 'src/models/interfaces/model.interface';
import { IOffice } from 'src/offices/interfaces/office.interface';
import { TechnicalInformService } from 'src/technical-inform/technical-inform.service';
import { GeneratePDFStickerDTO } from './dto/sticker.dto';
import { GeneratePDFTechnicalInformDTO } from './dto/technical-inform.dto';
import { PdfGeneratorService } from './pdf-generator.service';


@Auth()
@Controller('pdf-generator')
export class PdfGeneratorController {
  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly TechnicalInformService: TechnicalInformService,
    private readonly equipmentService: EquipmentService,
    private readonly badgetService: BadgetService
  ) {}

  @Get('badget/:id')
    async generateBadgetPDF(
      @Res() res,
      @Param() param: IdParamDTO
    ) {
      const id = convertMongoId(param.id)
      
      const selectBadget:IBadget = await this.badgetService.getAllBadgets({_id: id, populate:["advisor", "office","office.client", "office.city","office.city.state",  "user"] })
      const badget = selectBadget[0]
      const { number } = badget
      
      //const buffer = await this.pdfGeneratorService.secondExample();
      const buffer = await this.pdfGeneratorService.badget(badget);
      
      res.set({
          // pdf
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=presupuesto_${number}.pdf`,
          'Content-Length': buffer.length,
          // prevent cache
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0,
      });

      res.end(buffer);
    }
  
    @Get('technical-inform/:id')
    async generateTechnicalInformPDF(
      @Res() res,
      @Param() param: IdParamDTO
    ) {
      const id = convertMongoId(param.id)
      
      const selectInform = await this.TechnicalInformService.getInforms({_id: id, populate:["equipment.instrumentType", "equipment.model","equipment.office","equipment.office.client"] })
      const inform = selectInform[0]
      
      const instrument = (inform.equipment as any as IEquipment)
      const date = `${("0" + inform.date.getDate()).slice(-2)}-${("0" + (inform.date.getMonth() + 1)).slice(-2)}-${inform.date.getFullYear()}`;  
      const dateString = dateToEsString(inform.date)
      
      const TechnicalInform: GeneratePDFTechnicalInformDTO = {
        serialNumber: instrument.serialNumber,
        date,
        dateString,
        office: instrument.office as any as IOffice,
        client: (instrument.office as any as IOffice).client as any as IClient,
        comments: inform.comments,
        model: (instrument.model as any as IModel).name,
        descriptions: inform.descriptions,
        instrumentType: (instrument.instrumentType as any as IEquipmentTypes).type

      }
      
      const buffer = await this.pdfGeneratorService.TechnicalInform(TechnicalInform);
      res.set({
          // pdf
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=pdf.pdf`,
          'Content-Length': buffer.length,
          // prevent cache
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0,
      });
      res.end(buffer);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Get('sticker/:id')
    async generateStickerPDF(
      @Res() res,
      @Param() param: IdParamDTO
    ) {
    const id = convertMongoId(param.id)
    
    const instruments = await this.equipmentService.getAllEquipments({_id: id})
    const instrument = instruments[0]
    const calibrationExpirationDate = instrument.calibrationExpirationDate  
    
    const sticker: GeneratePDFStickerDTO = {
      serialNumber: instrument.serialNumber,
      day: `${("0" + calibrationExpirationDate.getDate()).slice(-2)}`,
      month: `${("0" + (calibrationExpirationDate.getMonth() + 1)).slice(-2)}`,
      year: `${calibrationExpirationDate.getFullYear().toString().slice(-2)}`,
      qr: instrument.qr
    }
    
    const buffer = await this.pdfGeneratorService.sticker(sticker);
    res.set({
        // pdf
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=pdf.pdf`,
        'Content-Length': buffer.length,
        // prevent cache
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
    });
    res.end(buffer);
    }

}