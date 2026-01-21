import {
    IsNotEmpty, IsOptional, IsString
} from 'class-validator';
  
  export class AddEquipmentTypesDTO {
      @IsString()
      @IsNotEmpty()
      type: string;

      @IsString()
      @IsOptional()
      description?: string;
}
