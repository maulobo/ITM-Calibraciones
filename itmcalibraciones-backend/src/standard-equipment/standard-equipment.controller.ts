import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { StandardEquipmentService } from "./standard-equipment.service";
import { CreateStandardEquipmentDto } from "./dto/create-standard-equipment.dto";
import { UpdateStandardEquipmentDto } from "./dto/update-standard-equipment.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { UserRoles } from "../common/enums/role.enum";

@Controller("standard-equipment")
@Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
export class StandardEquipmentController {
  constructor(
    private readonly standardEquipmentService: StandardEquipmentService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStandardEquipmentDto) {
    return this.standardEquipmentService.create(createDto);
  }

  @Get()
  findAll() {
    return this.standardEquipmentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.standardEquipmentService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateDto: UpdateStandardEquipmentDto,
  ) {
    return this.standardEquipmentService.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.standardEquipmentService.remove(id);
  }
}
