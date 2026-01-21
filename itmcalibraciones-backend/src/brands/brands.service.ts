import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { AddBrandCommand } from './commands/add-brand.command';
import { UpdateBrandCommand } from './commands/update-brand.command';
import { AddBrandDTO } from './dto/add-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FindAllBrandsQuery } from './queries/get-all-brands.query';


@Injectable()
export class BrandService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly imageUploadService: ImageUploadService,
        
    ) {}

    async addBrand(addBrandDTO: AddBrandDTO) { 
        try{
            return await this.commandBus.execute(new AddBrandCommand(addBrandDTO));
        }catch(e){
            console.log(e)
        }
        
    }

    async updateBrand(updateBrandDto: UpdateBrandDto) { 
        try{
            return await this.commandBus.execute(new UpdateBrandCommand(updateBrandDto));
        }catch(e){
            console.log(e)
        }
        
    }

    async getAllBrands() { 
        return this.queryBus.execute(new FindAllBrandsQuery());
    }

}
