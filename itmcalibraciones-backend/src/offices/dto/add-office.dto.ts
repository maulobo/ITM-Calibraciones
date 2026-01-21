import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId, IsNotEmpty, IsOptional, IsString
} from 'class-validator';
import { Types } from "mongoose";
  
  export class AddOfficeDTO {
        @IsMongoId()
        @IsOptional()
        @ApiProperty()
        id?: Types.ObjectId;

      @IsMongoId()
      @IsNotEmpty()
      @ApiProperty()
      client: Types.ObjectId;
  
      @IsString()
      @IsOptional()
      @ApiProperty()
      responsable: string;

      @IsString()
      @IsOptional()
      @ApiProperty()
      phoneNumber?: string;

      @IsString()
      @IsOptional() 
      @ApiProperty()
      adress?: string;

      @IsMongoId()
      @IsNotEmpty()
      @ApiProperty()
      city: Types.ObjectId;

      @IsString()
      @IsOptional()
      @ApiProperty()
      name: string;
  
}
