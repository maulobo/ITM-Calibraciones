import { Document, Types } from "mongoose";
import { StandardStatus } from "../schemas/standard-equipment.schema";

export interface ICertificateHistory {
  certificate: string;
  uploadDate: Date;
  expirationDate: Date;
}

export interface IStandardEquipment extends Document {
  readonly _id: Types.ObjectId;
  readonly name: string;
  readonly brand: Types.ObjectId;
  readonly model: Types.ObjectId;
  readonly serialNumber: string;
  readonly range: string;
  calibrationProvider?: string;
  certificateNumber?: string;
  certificate?: string;
  certificateHistory: ICertificateHistory[];
  calibrationDate?: Date;
  calibrationExpirationDate?: Date;
  status: StandardStatus;
  location?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
