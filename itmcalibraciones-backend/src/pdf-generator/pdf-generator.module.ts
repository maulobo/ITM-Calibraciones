import { Module } from '@nestjs/common';
import { BadgetsModule } from 'src/badgets/badgets.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { TechnicalInformModule } from 'src/technical-inform/technical-inform.module';
import { PdfGeneratorController } from './pdf-generator.controller';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [
    TechnicalInformModule,
    EquipmentModule,
    BadgetsModule
  ],
  controllers: [PdfGeneratorController],
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}