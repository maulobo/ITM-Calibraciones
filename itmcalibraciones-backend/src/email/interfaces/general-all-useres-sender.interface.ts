import { EmailTemplate } from "../enum/email-template.enum";

export interface IGeneralAllUsersSender {
    template: EmailTemplate
    url: string;
    name: string;
    lastName: string;
}
  