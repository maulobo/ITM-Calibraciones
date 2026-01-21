import { ICity } from "./city.types";
import { IClient } from "./client.type";

export interface IOffice {
    id: string
    phoneNumber: string;
    responsable?: string;
    adress: string;
    city: ICity
    name: string
    client?: IClient
  }


  export interface IAddOffice {
    id?: string
    phoneNumber: string;
    responsable?: string;
    adress: string;
    city: string
    name: string
    client: string
  }