import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray } from 'class-validator';
import { Document, Types } from 'mongoose';
import { CurrencyENUM } from 'src/common/enums/currency.enum';
import { BadgetStatusEnum } from '../enum/status.enum';
import { BadgetTypeENUM } from '../enum/type.enum';
import { VatENUM } from '../enum/vat.enum';


@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class BadgetEntity extends Document {
  @Prop({ required: true })
  types: BadgetTypeENUM[]

  @Prop()
  number: number;

  @Prop()
  year: number;

  @Prop({ required: true, ref: 'Office' })
  office: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  advisor: Types.ObjectId;

  @Prop({ ref: 'User' })
  user?: Types.ObjectId;

  // In case of the badget is refered to a person from outside of the system
  @Prop()
  attention?: String

  @Prop({required: true})
  date: Date;

  @Prop()
  reference?: String

  @Prop()
  deliveryTime?: string

  @Prop({required: true})
  offerValidity: Number // in days

  @Prop({required: true})
  paymentTerms: String // Example: "15 days from invoice date"

  @Prop({required: true})
  currency: CurrencyENUM

  @Prop({required: true})
  vat: VatENUM

  @Prop({default: true})
  showTotal: boolean

  @Prop()
  notes: String

  @Prop()
  @IsArray()
  selectedNotes: String[]

  @Prop({
    type: String,
    enum: Object.values(BadgetStatusEnum),
    default: BadgetStatusEnum.PENDING,
  })
  status: BadgetStatusEnum;

  // Populated when budget is sent to the client — enables portal filtering
  @Prop({ type: Types.ObjectId, ref: 'Client', index: true })
  client?: Types.ObjectId;

  // Reason provided by the client when rejecting
  @Prop()
  rejectionReason?: string;

  // Populated on client approval
  @Prop()
  approvedBy?: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'ServiceOrderEntity' })
  serviceOrder?: Types.ObjectId;

  @Prop({ ref: 'Equipment' })
  @IsArray()
  instrumentsRelated: String[]

  @Prop({ type: [{
    itemNumber:        Number,
    quantity:          Number,
    description:       String,
    unitPrice:         Number,
    discount:          Number,
    totalPrice:        Number,
    linkedOtCode:      { type: String },           // snapshot "OT-26-0006-1"
    linkedEquipmentId: { type: Types.ObjectId, ref: 'Equipment' },
  }] })
  details: {
    itemNumber?: number;
    quantity: number;
    description: string;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    linkedOtCode?: string;
    linkedEquipmentId?: Types.ObjectId;
  }[];
  
}
export const BadgetSchema = SchemaFactory.createForClass(BadgetEntity);

BadgetSchema.pre('save', function () {
  const currentYear = new Date().getFullYear();
  this.year = currentYear % 100;
});

// Virtual: código formateado "25-00154"
BadgetSchema.virtual('code').get(function () {
  if (this.year == null || this.number == null) return null;
  return `${String(this.year).padStart(2, '0')}-${String(this.number).padStart(5, '0')}`;
});



