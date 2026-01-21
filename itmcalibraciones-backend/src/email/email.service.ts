import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EnvEnum } from 'src/common/enums/env.enum';
import { IUser } from 'src/users/interfaces/user.interface';
import { promisify } from 'util';
import { EmailTemplate, EmailTemplateList } from './enum/email-template.enum';
import { ISendEmail } from './interfaces/send-email.interface';

const whiteListNames = ["javier.ceqiq", "jacintomontu"]

const isEmailWhitelisted = (email) => {
  const username = email.split("@")[0];
  for (let i = 0; i < whiteListNames.length; i++) {
    const whitelistUsername = whiteListNames[i];
    if (username === whitelistUsername || username.startsWith(`${whitelistUsername}+`)) {
      return true;
    }
  }
  return false;
}
@Injectable()
export class EmailService {
  async sendEmail(
    sendEmail: ISendEmail,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = {
      name: 'ITM Calibraciones',
      address: process.env.EMAIL_FROM
    }

    // Check emails sender is not a real user
    // Reject all emails account thar are not in the whitelist
    
    if(process.env.NODE_ENV === EnvEnum.DEV && !isEmailWhitelisted(sendEmail.to)){
        console.log("PELIGRO: Se Intentoo de enviar email a un usuario real:", sendEmail.to)
        return
    }
    console.log("______")
    console.log(sendEmail.bcc)
    console.log("______")
    
    return transporter.sendMail({
      from,
      to: sendEmail.to,
      subject: sendEmail.subject,
      html: sendEmail.html,
      bcc: sendEmail.bcc
    });
  }

  async compileTemplate(
    templatePath: EmailTemplate,
    locals: any,
  ): Promise<string> {
    const readFile = promisify(fs.readFile);
    
    const body = await readFile(templatePath, { encoding: 'utf-8' });
    const header = await readFile(EmailTemplate.HEADER, { encoding: 'utf-8' });
    const footer = await readFile(EmailTemplate.FOOTER, { encoding: 'utf-8' });

    const templates = [Handlebars.compile(header), Handlebars.compile(body), Handlebars.compile(footer)]
    
    let compiledEmail = '';

    templates.forEach((template) => {
      const renderedTemplate = template(locals);
      compiledEmail += renderedTemplate;
    });
    
    //console.log(compiledEmail)

    return compiledEmail;
  }

  async bulkSender({bulk, subject, from, template, locals}:{
    bulk: IUser[],
    subject: string,
    from: string,
    template: EmailTemplateList,
    locals: any
  }): Promise<SMTPTransport.SentMessageInfo> {

    console.log("====> SEND ALL USER EMAILS!: ", bulk.length)

    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    const sendBatch = async (batch) => {
      for (let user of batch) {
        const mergedLocals = Object.assign({}, locals, {
          url: `${process.env.FRONT_URL}`,
          name: user.name
        });
        console.log(mergedLocals)
          const html = await this.compileTemplate(
            EmailTemplate[template],
            mergedLocals,
          );
         
        this.sendEmail({ html, subject, to:user.email, from })
      }
    }
    
    const batchSize = 5;
    let currentIndex = 0;

    while (currentIndex < bulk.length) {
      const currentBatch = bulk.slice(currentIndex, currentIndex + batchSize);
      await sendBatch(currentBatch);
      currentIndex += batchSize;
      console.log(`Processed ${currentIndex} of ${bulk.length} emails`);
      await delay(1100);
    }

  }
}
