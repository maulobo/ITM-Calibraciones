import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class UserLoginHistoryEntity extends Document {
  @Prop({ required: true, ref: 'Users' })
  user: Types.ObjectId;
}

export const UserLoginHistorySchema = SchemaFactory.createForClass(UserLoginHistoryEntity);
