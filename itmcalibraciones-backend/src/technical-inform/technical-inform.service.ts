import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NewTechicalInformSender } from 'src/email/senders/new-technical-inform.sender';
import { UsersService } from 'src/users/users.service';
import { AddInformCommand } from './commands/add-inform.command';
import { GetInformDTO } from './dto/get-inform.dto';
import { AddTechnicalInformDTO } from './dto/technical-inform.dto';
import { ITechnicalInforms } from './interfaces/informs.interface';
import { FindInformsQuery } from './queries/get-all-informs.query';


@Injectable()
export class TechnicalInformService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly newTechicalInformSender: NewTechicalInformSender,
        private readonly userService: UsersService
    ) {}

    async addInform(addTechnicalInformDTO: AddTechnicalInformDTO) { 
        const newInform =  await this.commandBus.execute(new AddInformCommand(addTechnicalInformDTO));
        const instrument = newInform.equipment
        await instrument.populate("instrumentType")
        const usersToNotify = await this.userService.findUser({office: instrument.office})
        this.newTechicalInformSender.sendBulkEmail({
            bulk: usersToNotify,
            subject: `Nuevo informe técnico creado ${instrument.instrumentType.type} N/S: ${instrument.serialNumber}`,
            locals: {
                instrumentType: instrument.instrumentType.type,
                serialNumber: instrument.serialNumber
            }
        })
        return newInform
    }

    async getInforms(getInformDTO:GetInformDTO): Promise<ITechnicalInforms[]> { 
        return this.queryBus.execute(new FindInformsQuery(getInformDTO));
    }

}
