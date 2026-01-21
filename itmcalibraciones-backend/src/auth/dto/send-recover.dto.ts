import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class SendRecoverDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
