import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export const changePassword: ChangePasswordDTO = {
  password: 'passowrd',
  newPassword: 'newPassword',
};
