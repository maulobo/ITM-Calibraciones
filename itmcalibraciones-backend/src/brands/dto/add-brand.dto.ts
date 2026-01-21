import {
    IsNotEmpty, IsOptional, IsString
} from 'class-validator';
  
  export class AddBrandDTO {
      @IsString()
      @IsNotEmpty()
      name: string;

      @IsOptional()
      @IsString()
      image?: string;

}
