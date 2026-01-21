import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class CertificateEntity extends Document {
  @Prop({ required: true, ref: 'Equipment' })
  equipment: Types.ObjectId;

  @Prop({ required: true })
  calibrationDate: Date;

  @Prop({ required: true })
  calibrationExpirationDate: Date

  @Prop({ required: true })
  certificate: string;

  @Prop({ required: true })
  number: string;

  @Prop()
  deleted: boolean;
}

export const CertificateSchema = SchemaFactory.createForClass(CertificateEntity);
