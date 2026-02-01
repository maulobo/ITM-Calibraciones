import { IsString, IsOptional, IsDateString } from "class-validator";

export class ExternalProviderDto {
  @IsString()
  @IsOptional()
  providerName: string;

  @IsDateString()
  @IsOptional()
  sentDate: Date;

  @IsDateString()
  @IsOptional()
  projectedReturnDate: Date;

  @IsDateString()
  @IsOptional()
  actualReturnDate: Date;

  @IsString()
  @IsOptional()
  exitNote: string;
}
