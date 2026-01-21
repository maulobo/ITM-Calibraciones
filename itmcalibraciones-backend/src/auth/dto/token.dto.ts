import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class TokenDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
