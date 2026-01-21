import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class GetAllOfficesDTO {
  @IsOptional()
  @IsMongoId()
  client?: Types.ObjectId;
}