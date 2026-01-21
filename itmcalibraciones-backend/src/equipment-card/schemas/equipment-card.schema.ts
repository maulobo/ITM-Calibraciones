import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class EquipmentCardEntity extends Document {
  @Prop({ required: true, ref: 'Equipment' })
  equipment: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true })
  arrival: Date;

  @Prop()
  departure: Date;

  @Prop()
  remit: string;

  @Prop()
  diagnostic: string;

  @Prop()
  work: string;

  @Prop()
  observations: string;

  @Prop()
  certificate: string;

}

export const EquipmentCardSchema = SchemaFactory.createForClass(EquipmentCardEntity);
