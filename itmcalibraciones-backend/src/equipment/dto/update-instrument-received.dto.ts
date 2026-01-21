import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsMongoId
} from 'class-validator';
import { Types } from 'mongoose';
    
    export class UpdateInstrumentReceivedDTO {
    @IsMongoId()
    @ApiProperty()
    id: Types.ObjectId;
  
    @IsBoolean()
    @ApiProperty()
    received: boolean;
  }
  