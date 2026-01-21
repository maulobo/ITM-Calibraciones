import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class SignupDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEmail()
  token: string;
}
