import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty, IsOptional, IsString
} from 'class-validator';
import { Types } from 'mongoose';
  
  export class AddTechnicalInformDTO {
    @ApiProperty()
    @IsMongoId()
    @IsOptional()
    id?: Types.ObjectId;

    @ApiProperty()
    @IsMongoId()
    @IsOptional()
    user?: Types.ObjectId;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    equipment: Types.ObjectId;

    @ApiProperty()
    @IsString()
    @IsDateString()
    date: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    descriptions: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    comments: string;
}
