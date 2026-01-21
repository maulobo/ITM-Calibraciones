import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IBulkSenderParamsInterface } from './bullk-sender-params.interface';
import { ISenderParamsInterface } from './sender-params.interface';

export interface ISender<T> {
  sendEmail(
    data: ISenderParamsInterface<T>,
  ): Promise<SMTPTransport.SentMessageInfo>;
}


export interface IBulkSender<T> {
  sendBulkEmail(
    data: IBulkSenderParamsInterface<T>,
  ): Promise<SMTPTransport.SentMessageInfo>;
}