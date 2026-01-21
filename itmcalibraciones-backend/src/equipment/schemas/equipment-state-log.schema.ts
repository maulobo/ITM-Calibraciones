import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EquipmentStateEnum } from '../const.enum';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class EquipmentStateLogEntity extends Document {
  @Prop({ required: true, ref: 'Equipment' })
  equipment: Types.ObjectId;

  @Prop({ required: true, type: String, enum: Object.values(EquipmentStateEnum)})
  prev: EquipmentStateEnum;

  @Prop({ required: true, type: String, enum: Object.values(EquipmentStateEnum)})
  actual: EquipmentStateEnum;

}

export const EquipmentStateLogSchema = SchemaFactory.createForClass(EquipmentStateLogEntity);
