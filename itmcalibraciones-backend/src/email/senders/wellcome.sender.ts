import { Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailService } from '../email.service';
import { EmailTemplate } from '../enum/email-template.enum';
import { IEmailVerification } from '../interfaces/email-verification.interface';
import { ISenderParamsInterface } from '../interfaces/sender-params.interface';
import { ISender } from '../interfaces/sender.interface';

@Injectable()
export class EmailWelcomeSender implements ISender<IEmailVerification> {
  constructor(private emailService: EmailService) {}

  async sendEmail({
    subject,
    to,
    bcc,
    from,
    locals,
  }: ISenderParamsInterface<IEmailVerification>): Promise<SMTPTransport.SentMessageInfo> {
    
    const html = await this.emailService.compileTemplate(
      EmailTemplate.EMAIL_WELCOME,
      locals,
    );

    return this.emailService.sendEmail({ html, subject, to, from, bcc });
  }
}
