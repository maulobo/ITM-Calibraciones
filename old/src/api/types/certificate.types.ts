import { IInstrument } from "./instrument.type";

export interface ICertificate {
    id?: string,
    equipment: string | IInstrument;
    certificate: FileList | string
    calibrationDate: string
    calibrationExpirationDate: string
    createdAt: string
    updatedAt: string
    number: string
}

export interface IAddCertificate {
    id?: string,
    calibrationDate: string
    equipment: string;
    calibrationExpirationDate: string
    number: string

}