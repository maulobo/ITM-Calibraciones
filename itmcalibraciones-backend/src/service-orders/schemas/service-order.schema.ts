import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum ServiceOrderStateEnum {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
}

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ServiceOrderEntity extends Document {
  @Prop({ required: true, unique: true, index: true })
  code: string; // Format: OT-YY-XXXX (e.g., OT-26-0001)

  @Prop({ required: true, ref: "ClientsEntity" })
  client: Types.ObjectId;

  @Prop({
    type: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    required: true,
  })
  contact: {
    name: string;
    email: string;
    phone?: string;
  };

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop()
  deliveryDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(ServiceOrderStateEnum),
    default: ServiceOrderStateEnum.OPEN,
  })
  generalStatus: ServiceOrderStateEnum;

  @Prop({ type: [{ type: Types.ObjectId, ref: "EquipmentEntity" }] })
  equipments: Types.ObjectId[];

  @Prop()
  observations?: string;
}

export const ServiceOrderSchema =
  SchemaFactory.createForClass(ServiceOrderEntity);
ServiceOrderSchema.index({ code: 1 }, { unique: true });
