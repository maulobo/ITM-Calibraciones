import { IntersectionType, PartialType } from "@nestjs/swagger";
import { UpdateUserDTO } from "./update-user.dto";

export class UpdateUserProfileDTO extends IntersectionType(
    PartialType(UpdateUserDTO)
  ) {}