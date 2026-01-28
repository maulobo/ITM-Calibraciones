import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class OfficeEntity extends Document {
  @Prop({ required: true, ref: "Client", type: Types.ObjectId })
  client: Types.ObjectId;

  @Prop({ required: true, ref: "City", type: Types.ObjectId })
  city: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  responsable?: string;

  @Prop()
  adress?: string;
}

export const OfficeSchema = SchemaFactory.createForClass(OfficeEntity);
