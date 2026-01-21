import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { UserRoles } from 'src/common/enums/role.enum';


export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly adress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  roles?: UserRoles[];

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  office: Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  @IsString()
  area: string;

}