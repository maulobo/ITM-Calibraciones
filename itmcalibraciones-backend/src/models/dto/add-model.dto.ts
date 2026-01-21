import {
    IsMongoId,
    IsNotEmpty, IsString
} from 'class-validator';
import { Types } from 'mongoose';
  
  export class AddModelDTO {
      @IsString()
      @IsNotEmpty()
      name: string;

      @IsMongoId()
      @IsNotEmpty()
      brand: Types.ObjectId;

}
