export interface ISendEmail {
  to: string;
  subject: string;
  html: string;
  from?: string;
  bcc?: string[]
}
