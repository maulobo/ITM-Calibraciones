import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import {
  BlockTypeEnum,
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

  // Código de OT individual del equipo (ej: "OT-26-0006-1")
  // Siempre pertenece a un serviceOrder
  @Prop({ index: true })
  otCode?: string;

  @Prop({
    type: String,
    enum: Object.values(EquipmentTechnicalStateEnum),
    default: EquipmentTechnicalStateEnum.PENDING,
  })
  technicalState: EquipmentTechnicalStateEnum;

  // Campos de freno — solo presentes cuando technicalState === BLOCKED
  @Prop({ type: String, enum: Object.values(BlockTypeEnum) })
  blockType?: BlockTypeEnum;

  // Detalle del freno: nombre del repuesto (NEEDS_PART) o texto libre (otros)
  @Prop()
  blockReason?: string;

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

  @Prop({
    type: [
      {
        serviceOrder:              { type: Types.ObjectId, ref: "ServiceOrderEntity" },
        otCode:                    { type: String }, // Snapshot: "OT-26-0006-1"
        entryDate:                 { type: Date, default: Date.now },
        exitDate:                  { type: Date },
        entryObservations:         { type: String }, // Observaciones al ingreso
        exitObservations:          { type: String }, // Observaciones al retiro
        calibrationDate:           { type: Date },
        calibrationExpirationDate: { type: Date },
        certificateNumber:         { type: String },
        technicalResult:           { type: String },
        usedStandards:             [{ type: Types.ObjectId, ref: "StandardEquipment" }],
        technicianId:              { type: Types.ObjectId },
        technicianName:            { type: String },
      },
    ],
    _id: false,
    default: [],
  })
  serviceHistory: {
    serviceOrder: Types.ObjectId;
    otCode?: string;
    entryDate: Date;
    exitDate?: Date;
    entryObservations?: string;
    exitObservations?: string;
    calibrationDate?: Date;
    calibrationExpirationDate?: Date;
    certificateNumber?: string;
    technicalResult?: string;
    usedStandards?: Types.ObjectId[];
    technicianId?: Types.ObjectId;
    technicianName?: string;
  }[];

  @Prop({ required: true, ref: "Model" })
  model: Types.ObjectId;

  @Prop({ required: true, ref: "Office" })
  office: Types.ObjectId;

  // Dueño del equipo — nunca cambia aunque el equipo se mueva entre sucursales
  // Es la clave para evitar colisiones de S/N entre distintas empresas
  @Prop({ required: true, type: Types.ObjectId, ref: "Client" })
  client: Types.ObjectId;

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
  datasheet?: string;

  @Prop()
  outOfService?: boolean;

  // Person who physically picked up the equipment (recorded at delivery)
  @Prop()
  deliveredTo?: string;

  @Prop({
    type: [{
      action:        { type: String, required: true },
      label:         { type: String },
      performedBy:   { type: String },
      performedById: { type: Types.ObjectId },
      at:            { type: Date, default: Date.now },
      notes:         { type: String },
    }],
    _id: false,
    default: [],
  })
  actionHistory: {
    action: string;
    label?: string;
    performedBy?: string;
    performedById?: Types.ObjectId;
    at: Date;
    notes?: string;
  }[];
}

export const EquipmentSchema = SchemaFactory.createForClass(EquipmentEntity);

// Un equipo es único por: número de serie + modelo + cliente (empresa dueña)
// Dos empresas distintas pueden tener equipos con el mismo S/N sin colisión
EquipmentSchema.index({ serialNumber: 1, model: 1, client: 1 }, { unique: true });
