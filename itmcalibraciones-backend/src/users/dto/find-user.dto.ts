import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { QueryDTO } from "src/common/dto/query.dto";
import { CreateUserDTO } from "./create-user.dto";

export class FindUserDTO extends IntersectionType(
    PartialType(CreateUserDTO),
    QueryDTO,
) {
    @IsOptional()
    @IsMongoId()
    id?: Types.ObjectId

    @IsOptional()
    @IsMongoId()
    _id?: Types.ObjectId
}