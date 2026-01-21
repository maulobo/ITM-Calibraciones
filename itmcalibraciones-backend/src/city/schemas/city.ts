import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class CityEntity extends Document {
  @Prop({ required: true, ref: 'State' })
  state: Types.ObjectId;
  
  @Prop({ required: true })
  name:  string;
}

export const CitySchema = SchemaFactory.createForClass(CityEntity);
