import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { BrandController } from './brands.controller';
import { BrandService } from './brands.service';
import { AddBrandCommandHandler } from './commands/add-brand.command';
import { UpdateBrandCommandHandler } from "./commands/update-brand.command";
import { FindAllBrandsQueryHandler } from './queries/get-all-brands.query';
import { BrandSchema } from './schemas/brand.schema';


const QueriesHandler = [
  FindAllBrandsQueryHandler
  
];
const CommandHandlers = [
  AddBrandCommandHandler,
  UpdateBrandCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Brand', schema: BrandSchema },
    ]),
    ImageUploadModule
  ],
  providers: [
    BrandService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [BrandService,],
  controllers: [BrandController],
})
export class BrandsModule {}
