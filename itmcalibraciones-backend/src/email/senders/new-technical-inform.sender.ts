import { Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailService } from '../email.service';
import { EmailTemplateList } from '../enum/email-template.enum';
import { IBulkSenderParamsInterface } from '../interfaces/bullk-sender-params.interface';
import { INewTechnicalInformSender } from '../interfaces/new-technical-inform.interfaces';
import { IBulkSender } from '../interfaces/sender.interface';

@Injectable()
export class NewTechicalInformSender implements IBulkSender<INewTechnicalInformSender> {
  constructor(private emailService: EmailService) {}

  async sendBulkEmail({
    subject,
    bulk,
    from,
    locals
  }: IBulkSenderParamsInterface<INewTechnicalInformSender>): Promise<SMTPTransport.SentMessageInfo> {
    
   
    return await this.emailService.bulkSender({
        bulk,
        subject,
        from,
        locals,
        template: EmailTemplateList.NEW_Technical_INFORM
    })
  }
}
