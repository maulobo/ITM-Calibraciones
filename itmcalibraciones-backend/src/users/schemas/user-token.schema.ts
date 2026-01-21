import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserTokenSource } from '../enum/token-source.enum';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class UserTokenEntity extends Document {
  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId;
  
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  source: UserTokenSource;

  @Prop({ required: true, default: false})
  used: Boolean;

}

export const UserTokenSchema = SchemaFactory.createForClass(UserTokenEntity);
