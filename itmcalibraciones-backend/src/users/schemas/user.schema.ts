import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { Document, Types } from "mongoose";
import { UserRoles } from "src/common/enums/role.enum";

@Schema({ timestamps: true, toJSON: { virtuals: true } })
@Exclude()
export class UserEntity extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop()
  area: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Exclude()
  @Prop({ default: 0 })
  loginAttemps: number;

  @Prop({ default: [UserRoles.USER] })
  roles: UserRoles[];

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ required: true, ref: "Office" })
  office: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ClientsEntity", required: false })
  client?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
