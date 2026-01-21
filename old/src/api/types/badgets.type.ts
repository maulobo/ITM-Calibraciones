import { BadgetTypeENUM } from "@/const/badget.const";
import { IInstrument } from "./instrument.type";
import { IOffice } from "./office.type";
import { IUser } from "./user.types";

export type Detail = {
  itemNumber: number;
  quantity: number;
  description: string;
  unitPrice: number;
  discount: number;
  totalPrice: number;
};
export interface IBadget {
    advisor?: IUser
    types?: BadgetTypeENUM[]
    id?: string
    number?: number;
    year?: number;
    office: string | IOffice;
    user?: string;
    attention?: string;
    date: string;
    reference?: string;
    deliveryTime: string;
    offerValidity: number;
    paymentTerms: string;
    currency: string;
    vat: string;
    notes?: string;
    details?: Detail[];
    selectedNotes?: []
    createdAt?: string,
    showTotal?: boolean,
    instrumentsRelated: string[] | IInstrument[]
}
