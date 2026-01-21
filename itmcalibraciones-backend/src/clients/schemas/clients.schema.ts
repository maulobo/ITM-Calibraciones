import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ClientsEntity extends Document {
  @Prop({ required: true, unique: true, index: true })
  socialReason: string;

  @Prop({ required: true, unique: true, index: true })
  cuit: string;

  @Prop()
  email?: string; // Main contact/login email

  @Prop()
  responsable?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  adress?: string;

  @Prop({ required: true, ref: "City" })
  city: Types.ObjectId;

  @Prop({ ref: "State" })
  state: Types.ObjectId;

  // --- New Fields for "Project Fenix" ---
  @Prop()
  zipCode?: string;

  @Prop()
  defaultPaymentCondition?: string; // e.g. "30 days net"

  @Prop({
    type: [
      {
        name: String,
        email: String,
        phone: String,
        role: String,
      },
    ],
  })
  contacts?: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  }[];
  // -------------------------------------
}

export const ClientsSchema = SchemaFactory.createForClass(ClientsEntity);

ClientsSchema.index({ socialReason: 1, cuit: 1 }, { unique: true });
