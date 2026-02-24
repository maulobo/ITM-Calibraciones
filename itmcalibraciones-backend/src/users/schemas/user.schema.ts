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

  // Vinculación con Sucursal (Scope de visibilidad principal)
  // Un usuario "Cliente" (USER) solo ve órdenes de SU sucursal.
  // Para usuarios ADMIN/TECHNICAL no es requerida.
  @Prop({ required: false, ref: "Office", type: Types.ObjectId, default: null })
  office: Types.ObjectId;

  // Especialidad del técnico (ej: "Metrología dimensional", "Presión")
  // Aplica a usuarios con rol ADMIN/TECHNICAL
  @Prop({ required: false })
  specialty?: string;

  // Vinculación con Cliente (Organizacional)
  // Si está definido, el usuario es externo (pertenece a esa empresa).
  @Prop({ type: Types.ObjectId, ref: "Client", required: false })
  client?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
