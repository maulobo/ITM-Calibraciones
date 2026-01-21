import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class IdDTO {
  @ApiProperty({
    description: 'An Id',
    type: Types.ObjectId,
  })
  @IsNotEmpty()
  @IsMongoId()
  id: Types.ObjectId;
}

export const idParam: IdDTO = {
  id: new Types.ObjectId(),
};
