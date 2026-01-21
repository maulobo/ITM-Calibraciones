import { Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailService } from '../email.service';
import { EmailTemplate } from '../enum/email-template.enum';
import { IEmailVerification } from '../interfaces/email-verification.interface';
import { IResetPassword } from '../interfaces/reset-password.interface';
import { ISenderParamsInterface } from '../interfaces/sender-params.interface';
import { ISender } from '../interfaces/sender.interface';

@Injectable()
export class ResetPasswordSender implements ISender<IResetPassword> {
  constructor(private emailService: EmailService) {}

  async sendEmail({
    subject,
    to,
    from,
    locals,
  }: ISenderParamsInterface<IResetPassword>): Promise<SMTPTransport.SentMessageInfo> {
    
    const html = await this.emailService.compileTemplate(
      EmailTemplate.RESET_PASSWORD,
      locals,
    );

    return this.emailService.sendEmail({ html, subject, to, from });
  }
}
