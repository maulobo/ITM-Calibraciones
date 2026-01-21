import { Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailService } from '../email.service';
import { EmailTemplateList } from '../enum/email-template.enum';
import { IBulkSenderParamsInterface } from '../interfaces/bullk-sender-params.interface';
import { INewInstrumentSender } from '../interfaces/new-instrument.interfaces';
import { IBulkSender } from '../interfaces/sender.interface';

@Injectable()
export class InstrumentSoonExpiredSender implements IBulkSender<INewInstrumentSender> {
  constructor(private emailService: EmailService) {}

  async sendBulkEmail({
    subject,
    bulk,
    from,
    locals
  }: IBulkSenderParamsInterface<INewInstrumentSender>): Promise<SMTPTransport.SentMessageInfo> {
    
   
    return await this.emailService.bulkSender({
        bulk,
        subject,
        from,
        locals,
        template: EmailTemplateList.INSTRUMENT_SOON_EXPIRED
    })
  }
}
