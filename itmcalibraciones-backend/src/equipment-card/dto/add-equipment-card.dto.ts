import {
    IsDateString,
    IsMongoId, IsNotEmpty, IsOptional
} from 'class-validator';
import { Types } from "mongoose";
  
  export class AddEquipmentCardDTO {
      @IsMongoId()
      @IsNotEmpty()
      equipment: Types.ObjectId;

      @IsMongoId()
      @IsNotEmpty()
      user: Types.ObjectId;

      @IsDateString()
      @IsOptional()
      arrival: string;

}