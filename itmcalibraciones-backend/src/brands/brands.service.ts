import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { AddBrandCommand } from "./commands/add-brand.command";
import { UpdateBrandCommand } from "./commands/update-brand.command";
import { AddBrandDTO } from "./dto/add-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { IBrand } from "./interfaces/brand.interface";
import { FindAllBrandsQuery } from "./queries/get-all-brands.query";

@Injectable()
export class BrandService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly imageUploadService: ImageUploadService,
    @InjectModel("Brand") private readonly brandModel: Model<IBrand>,
  ) {}

  async addBrand(addBrandDTO: AddBrandDTO) {
    try {
      return await this.commandBus.execute(new AddBrandCommand(addBrandDTO));
    } catch (e) {
      console.log(e);
    }
  }

  async updateBrand(updateBrandDto: UpdateBrandDto) {
    try {
      return await this.commandBus.execute(
        new UpdateBrandCommand(updateBrandDto),
      );
    } catch (e) {
      console.log(e);
    }
  }

  async getAllBrands() {
    return this.queryBus.execute(new FindAllBrandsQuery());
  }

  async deleteBrand(id: Types.ObjectId): Promise<{ deleted: boolean }> {
    const result = await this.brandModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
