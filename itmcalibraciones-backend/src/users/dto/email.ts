import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class emailDTO {
  @ApiProperty({
    description: 'An email',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: String
}

export const idParam: emailDTO = {
  email: "emai@email.com",
};
