import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UserRoles } from "src/common/enums/role.enum";
import { convertMongoId } from "src/common/utils/common-functions";
import { AddOfficeDTO } from "./dto/add-office.dto";
import { GetAllOfficesDTO } from "./dto/get-all-offices.dto";
import { IOffice } from "./interfaces/office.interface";
import { OfficeService } from "./office.service";

@Controller("offices")
export class OfficeController {
  constructor(private officeService: OfficeService) {}

  @Auth()
  @Post("/add-or-update")
  async addOffice(@Body() addOfficeDTO: AddOfficeDTO): Promise<IOffice> {
    if (addOfficeDTO.id) addOfficeDTO.id = convertMongoId(addOfficeDTO.id);
    return await this.officeService.addOffice(addOfficeDTO);
  }

  @Auth()
  @Get("/all")
  async getAllOffices(@Query() query: GetAllOfficesDTO): Promise<IOffice[]> {
    if (query && query.client) query.client = convertMongoId(query.client);
    return await this.officeService.getAllOffices(query);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Delete("/:id")
  async deleteOffice(@Param("id") id: string): Promise<{ deleted: boolean }> {
    return await this.officeService.deleteOffice(new Types.ObjectId(id));
  }
}
