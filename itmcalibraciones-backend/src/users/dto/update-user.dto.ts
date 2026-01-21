import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { UserDTO } from './user.dto';


export class UpdateUserDTO extends IntersectionType(
  PartialType(UserDTO)
) {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  office: Types.ObjectId
}