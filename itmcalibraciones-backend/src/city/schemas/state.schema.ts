import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class StateEntity extends Document {
  @Prop({ required: true, unique: true })
  nombre: string;
}

export const StateSchema = SchemaFactory.createForClass(StateEntity);
