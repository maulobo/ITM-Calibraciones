import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { BadgetStatusEnum } from '../enum/status.enum';

export class UpdateBadgetStatusDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsEnum(BadgetStatusEnum)
  @IsNotEmpty()
  status: BadgetStatusEnum;
}
