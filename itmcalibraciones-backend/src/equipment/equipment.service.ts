import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Cron } from '@nestjs/schedule';
import { Types } from 'mongoose';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CertificateService } from 'src/certificates/certificate.service';
import { InstrumentSoonExpiredSender } from 'src/email/senders/instrument-soon-expired.sender';
import { NewInstrumentSender } from 'src/email/senders/new-instrument.sender';
import { IEquipmentTypes } from 'src/equipment-types/interfaces/equipment-types.interface';
import { QRService } from 'src/qr/qr.service';
import { UsersService } from 'src/users/users.service';
import { AddEquipmentCommand } from './commands/add-equipment.command';
import { UpdateInstrumentCommand } from './commands/update-instrument.command';
import { AddEquipmentDTO } from './dto/add-equipment.dto';
import { GetInstrumentsDTO } from './dto/get-instruments.dto';
import { UpdateInstrumentReceivedDTO } from './dto/update-instrument-received.dto';
import { UpdateInstrumentDTO } from './dto/update-instrument.dto';
import { IEquipment } from './interfaces/equipment.interface';
import { FindAllEquipmentsQuery } from './queries/get-all-equipment.query';


@Injectable()
export class EquipmentService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly qrService: QRService,
        @Inject(forwardRef(() => CertificateService))
        private certificateService: CertificateService,
        private userService: UsersService,
        private newInstrumentSender: NewInstrumentSender,
        private emailInstrumentSoonExpiredSender: InstrumentSoonExpiredSender
    ) {}
    
    @Cron('0 6 * * *')
    async notifyInstrumentSoonExpired() {
        const inXdays = new Date();
        inXdays.setDate(inXdays.getDate() + 30);
        inXdays.setUTCHours(0, 0, 0, 0);
        const params:GetInstrumentsDTO = {
            calibrationExpirationDate:inXdays,
            orWhere: [{ values: [ false, undefined], field: "outOfService" }],
            populate:["instrumentType"]
        }
        const instruments = await this.getAllEquipments(params);

        console.log(`Instruments soon expired: ${instruments.length}`)

        for (const instrument of instruments) {
            
          const usersToNotify = await this.userService.findUser({ office: instrument.office });
          console.log(`Instruments ${instrument.serialNumber}, usersToNotify: ${usersToNotify.length}`)
          const instrumentType = (instrument.instrumentType as any as IEquipmentTypes).type;
          try {
            
            await this.emailInstrumentSoonExpiredSender.sendBulkEmail({
              bulk: usersToNotify,
              subject: `Calibración pronta a vencer, ${instrumentType} N/S: ${instrument.serialNumber}`,
              locals: {
                instrumentType: instrumentType,
                serialNumber: instrument.serialNumber
              }
            });
          } catch (e) {
            console.log(`Error sending new Instrument Bulk`);
            console.log(e);
          }
        }
      }


    async addEquipment(addEquipmentDTO: AddEquipmentDTO) { 
        const { sendEmailNotification } = addEquipmentDTO
        const BACK_URL = process.env.BACK_URL
        const instrument =  await this.commandBus.execute(new AddEquipmentCommand(addEquipmentDTO));
        const qr = await this.qrService.generateQRCode(`${BACK_URL}/instruments/qr/${instrument.id}`)
        const updateInstrumentDTO: UpdateInstrumentDTO = {...addEquipmentDTO, id: new Types.ObjectId(instrument.id), qr }
        
        if(sendEmailNotification){
            const usersToNotify = await this.userService.findUser({office: instrument.office})
            try{
                this.newInstrumentSender.sendBulkEmail({
                    bulk: usersToNotify,
                    subject: `Nuevo ${instrument.instrumentType.type} creado N/S: ${instrument.serialNumber}`,
                    locals: {
                        instrumentType: instrument.instrumentType.type,
                        serialNumber: instrument.serialNumber
                    }
                });
            }catch(e){
                console.log(`Error sending new Instrument Bulk`)
                console.log(e)
            }
            
        }
        
        return await this.updateInstrument(updateInstrumentDTO)
    }

    async updateInstrument(updateInstrumentDTO: UpdateInstrumentDTO) { 
        return this.commandBus.execute(new UpdateInstrumentCommand(updateInstrumentDTO));
    }

    async getAllEquipments(params:GetInstrumentsDTO): Promise<IEquipment[]> { 
        return this.queryBus.execute(new FindAllEquipmentsQuery(params));
    }

    async instrumentUserAccess(user: JwtPayload, instrument:IEquipment):Promise<boolean>{
        const userOffice = user.office
        return instrument.office?._id.toString() === userOffice
    }

    async updateInstrumentReceivedStatus(updateInstrumentReceivedDTO:UpdateInstrumentReceivedDTO):Promise<IEquipment>{
        const { received, id } = updateInstrumentReceivedDTO
        const instruments = await this.getAllEquipments({
            _id:id,
            populate: ["model.brand", "instrumentType", "office.client"]
        })
        const instrument = instruments[0]
        if(received){
            // Put expirationDate as undefined
            instrument.calibrationExpirationDate = undefined
        }

        if(!received){
            // Take the last expirationDate and put in the instrument
            const certificates = await this.certificateService.getCertificate({
                equipment: id
            })
            const newExpiratinDate = certificates[0].calibrationExpirationDate
            instrument.calibrationExpirationDate = newExpiratinDate
        }
        return await instrument.save()
    }

    async cleanInstrumentUserAccess(user: JwtPayload, instrumentes:IEquipment[]):Promise<IEquipment[]>{
        const filteredInstruments = await Promise.all(
            instrumentes.map(async (instrument) => {
              const hasAccess = await this.instrumentUserAccess(user, instrument);
              return hasAccess ? instrument : null;
            })
          );
        
          return filteredInstruments.filter((instrument) => instrument !== null);
    }
    

}
