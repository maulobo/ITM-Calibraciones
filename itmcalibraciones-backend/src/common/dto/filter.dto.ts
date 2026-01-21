import { IsString, ValidateIf } from 'class-validator';

export class FilterDTO {
  @ValidateIf((o) => o.filterName)
  @IsString()
  filterName?: string;

  @ValidateIf((o) => o.filterValue)
  @IsString()
  filterValue?: any;
}
