import { EquipmentStateEnum } from "@/const/equipmentState.const";
import { InstrumentTypeEnum } from "@/const/instrumentTypes.const";
import { IBrand } from "./brands.type";
import { ICertificate } from "./certificate.types";
import { IINstrumentType } from "./intruments-type.type";
import { IModel } from "./models.type";
import { IOffice } from "./office.type";

export interface IInstrument {
    instrumentType: InstrumentTypeEnum | string | IINstrumentType;
    serialNumber: string;
    customSerialNumber: string;
    brand: string | IBrand;
    model: string | IModel;
    calibrationExpirationDate: string
    state: EquipmentStateEnum,
    range: string
    id: string
    office: string | IOffice
    label?: string
    certificate?: string | ICertificate
    qr?: string
    description?:string
    outOfService?:boolean
}

export interface IUpdateInstrument {
    instrumentType?: InstrumentTypeEnum | string;
    serialNumber?: string;
    customSerialNumber?: string;
    brand?: string;
    model?: string;
    calibrationExpirationDate?: string;
    state?: EquipmentStateEnum;
    clientName?: string;
    range?: string;
    id?: string;
    office?: string | IOffice;
    label?: string;
    qr?: string;
    description?:string
    outOfService?:boolean
}

export interface IUpdateInstrumentReceived {
    id: string
    received: boolean;
}

export interface IAddInstrument {
    instrumentType: InstrumentTypeEnum | string;
    serialNumber: string;
    model: string;
    office: string
    range?: string
    description?: string
    outOfService?:boolean
}

