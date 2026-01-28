import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ModelEntity extends Document {
  @Prop({ required: true, ref: "Brand" })
  brand: Types.ObjectId;

  @Prop({ required: true, ref: "EquipmentTypes" })
  equipmentType: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

// TODO: brand and name unique as Key compose
export const ModelSchema = SchemaFactory.createForClass(ModelEntity);
