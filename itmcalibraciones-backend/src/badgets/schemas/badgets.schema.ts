import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray } from 'class-validator';
import { Document, Types } from 'mongoose';
import { CurrencyENUM } from 'src/common/enums/currency.enum';
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

  @Prop({required: true})
  deliveryTime: string

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

  @Prop({ ref: 'Equipment' })
  @IsArray()
  instrumentsRelated: String[]

  @Prop({ type: [{ 
    itemNumber: Number, 
    quantity: Number, 
    description: String, 
    unitPrice: Number, 
    discount: Number, 
    totalPrice: Number 
  }] })
  details: {
    itemNumber: number;
    quantity: number;
    description: string;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }[];
  
}
export const BadgetSchema = SchemaFactory.createForClass(BadgetEntity);

BadgetSchema.pre('save', function () {
  const currentYear = new Date().getFullYear();
  this.year = currentYear % 100; // Obtiene los dos últimos dígitos del año actual
});



