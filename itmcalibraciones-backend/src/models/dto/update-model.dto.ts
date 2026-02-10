import { PartialType } from "@nestjs/swagger";
import { AddModelDTO } from "./add-model.dto";

export class UpdateModelDTO extends PartialType(AddModelDTO) {}
