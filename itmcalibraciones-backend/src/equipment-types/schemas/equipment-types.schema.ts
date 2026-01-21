import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class EquipmentTypesEntity extends Document {
  @Prop({ required: true })
  type: string;

  @Prop()
  description: string;
}

export const EquipmentTypesSchema = SchemaFactory.createForClass(EquipmentTypesEntity);
