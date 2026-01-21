import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SelectedCompanyDTO {
  @IsNotEmpty()
  @IsMongoId()
  selectedCompany: Types.ObjectId;
}

export const selectedCompany: SelectedCompanyDTO = {
  selectedCompany: new Types.ObjectId(),
};
