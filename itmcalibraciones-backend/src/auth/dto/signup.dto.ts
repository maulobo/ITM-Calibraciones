import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { UserRoles } from 'src/common/enums/role.enum';

export default class SignupDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsArray()
  roles: UserRoles[];

  @IsNotEmpty()
  @IsMongoId()
  office: Types.ObjectId;

  
}
