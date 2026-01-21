import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class IdParamDTO {
  @IsNotEmpty()
  @IsMongoId()
  id: Types.ObjectId;
}

export const idParam: IdParamDTO = {
  id: new Types.ObjectId(),
};
