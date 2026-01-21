import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { Types } from 'mongoose';
  
  export class AddCertificateDTO {
    @ApiProperty()
    @IsMongoId()
    @IsOptional()
    id?: Types.ObjectId;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    equipment: Types.ObjectId;

    @ApiProperty()
    @IsString()
    @IsOptional()
    certificate?: string;

    @ApiProperty()
    @IsString()
    @IsDateString()
    @IsNotEmpty()
    calibrationDate: string;

    @ApiProperty()
    @IsString()
    @IsDateString()
    @IsNotEmpty()
    calibrationExpirationDate: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    number: string

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    deleted: boolean
    
}
