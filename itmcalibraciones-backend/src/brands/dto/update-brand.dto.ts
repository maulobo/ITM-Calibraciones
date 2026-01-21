import { PartialType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { AddBrandDTO } from "./add-brand.dto";

export class UpdateBrandDto extends PartialType(AddBrandDTO) {
    @IsMongoId()
    @IsNotEmpty()
    id: Types.ObjectId
}