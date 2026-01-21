import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { EquipmentModule } from 'src/equipment/equipment.module';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { AddCertificateCommandHandler } from './commands/certificate.command';
import { DeleteCertificateCommandHandler } from './commands/delete-certificate.command';
import { FindCertificateHandler } from './queries/get-certificate.query';
import { CertificateSchema } from './schemas/certificate.schema';


const QueriesHandler = [
  FindCertificateHandler
];
const CommandHandlers = [
  AddCertificateCommandHandler,
  DeleteCertificateCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Certificate', schema: CertificateSchema },
    ]),
    ImageUploadModule,
    forwardRef(() => EquipmentModule)
  ],
  providers: [
    CertificateService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [CertificateService,],
  controllers: [CertificateController],
})
export class CertificateModule {}
