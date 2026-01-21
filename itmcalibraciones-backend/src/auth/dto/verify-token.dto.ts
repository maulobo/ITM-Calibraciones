import { IsNotEmpty, IsString } from 'class-validator';

export default class VerifyTokenDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
