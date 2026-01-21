import { ApiProperty } from '@nestjs/swagger';
import {
    IsMongoId,
    IsNotEmpty
} from 'class-validator';
import { Types } from 'mongoose';
  
  export class AddEquipmentStateLogDTO {
      @IsMongoId()
      @IsNotEmpty()
      @ApiProperty()
      equipment: Types.ObjectId;

      @IsMongoId()
      @IsNotEmpty()
      @ApiProperty()
      prev: Types.ObjectId;

      @IsMongoId()
      @IsNotEmpty()
      @ApiProperty()
      actual: Types.ObjectId;
}
