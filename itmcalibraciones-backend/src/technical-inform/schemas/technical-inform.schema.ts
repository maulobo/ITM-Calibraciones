import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class TechnicalInformEntity extends Document {
  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, ref: 'Equipment' })
  equipment: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  descriptions: string;

  @Prop({ required: true })
  comments: string;
}

export const TechnicalInformSchema = SchemaFactory.createForClass(TechnicalInformEntity);
