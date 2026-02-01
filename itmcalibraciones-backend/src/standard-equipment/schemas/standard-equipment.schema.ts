import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum StandardStatus {
  ACTIVO = "ACTIVO",
  FUERA_DE_SERVICIO = "FUERA_DE_SERVICIO",
  EN_CALIBRACION = "EN_CALIBRACION",
  VENCIDO = "VENCIDO",
}

@Schema({ _id: false })
export class CertificateHistory {
  @Prop({ required: true })
  certificate: string; // URL

  @Prop({ required: true, default: Date.now })
  uploadDate: Date;

  @Prop({ required: true })
  expirationDate: Date;
}

const CertificateHistorySchema =
  SchemaFactory.createForClass(CertificateHistory);

@Schema({ timestamps: true })
export class StandardEquipment extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: "Brand", required: true })
  brand: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Model", required: true })
  model: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  serialNumber: string;

  @Prop({ required: true })
  range: string;

  @Prop()
  calibrationProvider: string; // Empresa que realizó la calibración (ej. INTI, Viditec)

  @Prop() // A veces es útil tener el número escrito aparte del archivo
  certificateNumber: string;

  @Prop()
  certificate: string; // URL del certificado actual

  @Prop({ type: [CertificateHistorySchema], default: [] })
  certificateHistory: CertificateHistory[]; // Historial

  @Prop()
  calibrationDate: Date;

  @Prop()
  calibrationExpirationDate: Date;

  @Prop({ enum: StandardStatus, default: StandardStatus.ACTIVO, index: true })
  status: StandardStatus;

  @Prop()
  location: string;
}

export const StandardEquipmentSchema =
  SchemaFactory.createForClass(StandardEquipment);
