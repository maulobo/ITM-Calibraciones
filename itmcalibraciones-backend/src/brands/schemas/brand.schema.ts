import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class BrandEntity extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  image?: string;
}

export const BrandSchema = SchemaFactory.createForClass(BrandEntity);
