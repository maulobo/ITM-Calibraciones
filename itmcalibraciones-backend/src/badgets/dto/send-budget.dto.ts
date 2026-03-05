import { IsArray, IsEmail, ArrayMinSize } from 'class-validator';

export class SendBudgetDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  recipients: string[];
}
