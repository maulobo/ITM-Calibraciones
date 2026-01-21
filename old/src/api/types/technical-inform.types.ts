import { IInstrument } from "./instrument.type";
import { IUser } from "./user.types";

export interface ITechnicalInform {
  user?: string | IUser,
  equipment: string | IInstrument,
  date: string | Date,
  descriptions: string,
  comments: string
  id?: string
}