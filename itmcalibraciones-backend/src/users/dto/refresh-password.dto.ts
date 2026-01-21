import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshUserPasswordDTO {
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
