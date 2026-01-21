import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CompanyId {
  @IsNotEmpty()
  @IsMongoId()
  companyId: Types.ObjectId;
}
