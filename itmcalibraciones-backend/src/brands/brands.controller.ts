import {
  Body,
  Controller, Get, Post,
  Put,
  UploadedFile
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/role.enum';
import { BrandService } from './brands.service';
import { AddBrandDTO } from './dto/add-brand.dto';
import { IBrand } from './interfaces/brand.interface';
  
              
  @Auth()
  @Controller('brands')
  export class BrandController {
    constructor(
      private brandService: BrandService,
    ) {}

    @Auth(UserRoles.ADMIN)
    @Post("/")
    async addBrand(
      @Body() addBrandDTO: AddBrandDTO,
    ): Promise<IBrand> {
      try{
        return await this.brandService.addBrand(addBrandDTO);
      }catch(e){
        console.log(e)
      }
      
    }

    @Auth(UserRoles.ADMIN)
    @Post("/:brand")
    async uploadImageBrand(
      @Body() addBrandDTO: AddBrandDTO,
      @UploadedFile() file
    ): Promise<IBrand> {
      try{
        return await this.brandService.addBrand(addBrandDTO);
      }catch(e){
        console.log(e)
      }
    }

    @Auth(UserRoles.ADMIN)
    @Put("/:brand")
    async updateBrand(
      @Body() addBrandDTO: AddBrandDTO
    ): Promise<IBrand> {
      try{
        return await this.brandService.addBrand(addBrandDTO);
      }catch(e){
        console.log(e)
      }
    }



    @Auth()
    @Get("/")
    async getAllBrands(): Promise<IBrand[]> {
      return await this.brandService.getAllBrands();
    }
  
    
  }
  