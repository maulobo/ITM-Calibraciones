import { IUser } from "src/users/interfaces/user.interface";
import { EmailTemplateList } from "../enum/email-template.enum";

export interface IBulkSenderParamsInterface<T> {
  bulk: IUser[];
  locals?: T;
  subject?: string;
  from?: string;
  template?: EmailTemplateList
}
