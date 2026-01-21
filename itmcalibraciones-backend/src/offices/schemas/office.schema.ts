import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class OfficeEntity extends Document {
  @Prop({ required: true, ref: 'Client' })
  client: Types.ObjectId;
  
  @Prop({ required: true, ref: 'City'})
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
