import { ICity, IState } from "./city.types";

export interface IClient {
    id: string
    cuit: string;
    socialReason: string;
    phoneNumber: string,
    responsable?: string
    city: string | ICity
    state?: string | IState
  }

  export interface AddIClient {
    id?: string
    cuit: string;
    socialReason: string;
    phoneNumber: string,
    responsable?: string
    city: string
    state: string
  }