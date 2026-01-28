import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
} from "@nestjs/common";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UserRoles } from "src/common/enums/role.enum";
import { BrandService } from "./brands.service";
import { AddBrandDTO } from "./dto/add-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { IBrand } from "./interfaces/brand.interface";

@Auth()
@Controller("brands")
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Post("/")
  async addBrand(@Body() addBrandDTO: AddBrandDTO): Promise<IBrand> {
    try {
      return await this.brandService.addBrand(addBrandDTO);
    } catch (e) {
      console.log(e);
    }
  }

  @Auth(UserRoles.ADMIN)
  @Post("/:brand")
  async uploadImageBrand(
    @Body() addBrandDTO: AddBrandDTO,
    @UploadedFile() file,
  ): Promise<IBrand> {
    try {
      return await this.brandService.addBrand(addBrandDTO);
    } catch (e) {
      console.log(e);
    }
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Put("/:id")
  async updateBrand(
    @Param("id") id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<IBrand> {
    try {
      updateBrandDto.id = new Types.ObjectId(id);
      return await this.brandService.updateBrand(updateBrandDto);
    } catch (e) {
      console.log(e);
    }
  }

  @Auth()
  @Get("/")
  async getAllBrands(): Promise<IBrand[]> {
    return await this.brandService.getAllBrands();
  }

  @Auth(UserRoles.ADMIN)
  @Delete("/:id")
  async deleteBrand(@Param("id") id: string): Promise<{ deleted: boolean }> {
    return await this.brandService.deleteBrand(new Types.ObjectId(id));
  }
}
