import { PartialType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { AddBadgetDTO } from "./add-badgets.dto";

export class UpdateBadgetDto extends PartialType(AddBadgetDTO) {
    @IsMongoId()
    @IsNotEmpty()
    id: Types.ObjectId
}