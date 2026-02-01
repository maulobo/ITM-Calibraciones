import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import {
  EquipmentStateEnum,
  EquipmentTechnicalStateEnum,
  EquipmentLogisticStateEnum,
  EquipmentLocationEnum,
  PurchaseOrderRequirementEnum,
} from "../const.enum";

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class EquipmentEntity extends Document {
  @Prop({ required: true })
  serialNumber: string;

  @Prop()
  customSerialNumber: string;

  // --- New Fields for "Project Fenix" ---
  @Prop()
  tag?: string;

  @Prop()
  linkPipe?: string;

  @Prop({
    type: String,
    enum: Object.values(PurchaseOrderRequirementEnum),
    default: PurchaseOrderRequirementEnum.NOT_REQUIRED,
  })
  purchaseOrderRequirement: PurchaseOrderRequirementEnum;

  @Prop({ type: Types.ObjectId, ref: "ServiceOrderEntity" })
  serviceOrder?: Types.ObjectId;

  @Prop()
  orderIndex?: number;

  @Prop({
    type: String,
    enum: Object.values(EquipmentTechnicalStateEnum),
    default: EquipmentTechnicalStateEnum.TO_CALIBRATE,
  })
  technicalState: EquipmentTechnicalStateEnum;

  @Prop({
    type: String,
    enum: Object.values(EquipmentLogisticStateEnum),
    default: EquipmentLogisticStateEnum.RECEIVED,
  })
  logisticState: EquipmentLogisticStateEnum;

  @Prop({
    type: String,
    enum: Object.values(EquipmentLocationEnum),
    default: EquipmentLocationEnum.ITM,
  })
  location: EquipmentLocationEnum;

  @Prop({
    type: {
      providerName: String,
      sentDate: Date,
      projectedReturnDate: Date,
      actualReturnDate: Date,
      exitNote: String,
    },
  })
  externalProvider?: {
    providerName: string;
    sentDate: Date;
    projectedReturnDate: Date;
    actualReturnDate: Date; // Fecha real de re-ingreso
    exitNote: string;
  };

  // --- Campos de Entrega / Retiro ---
  @Prop()
  certificateNumber?: string; // Nª de certificado

  @Prop()
  remittanceNumber?: string; // Nª de Remito

  @Prop()
  retireDate?: Date; // Fecha efectiva de retiro
  // ----------------------------------

  @Prop({ type: [{ type: Types.ObjectId, ref: "StandardEquipment" }] })
  usedStandards?: Types.ObjectId[];

  @Prop({ required: true, ref: "Model" })
  model: Types.ObjectId;

  @Prop({ required: true, ref: "Office" })
  office: Types.ObjectId;

  @Prop()
  label?: string;

  @Prop()
  range?: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: Object.values(EquipmentStateEnum),
    default: EquipmentStateEnum.CREATED,
  })
  state: EquipmentStateEnum;

  @Prop()
  calibrationDate?: Date;

  @Prop()
  calibrationExpirationDate?: Date;

  @Prop()
  certificate: string;

  @Prop()
  qr?: string;

  @Prop()
  outOfService?: boolean;
}

export const EquipmentSchema = SchemaFactory.createForClass(EquipmentEntity);

EquipmentSchema.index({ serialNumber: 1, office: 1 }, { unique: true });
