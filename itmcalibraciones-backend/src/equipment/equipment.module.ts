import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { CertificateModule } from 'src/certificates/certificate.module';
import { EmailModule } from 'src/email/email.module';
import { QRModule } from 'src/qr/qr.module';
import { UsersModule } from 'src/users/users.module';
import { AddEquipmentCommandHandler } from './commands/add-equipment.command';
import { UpdateInstrumentCommandHandler } from './commands/update-instrument.command';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { FindAllEquipmentsQueryHandler } from './queries/get-all-equipment.query';
import { EquipmentStateLogSchema } from './schemas/equipment-state-log.schema';
import { EquipmentSchema } from './schemas/equipment.schema';


const QueriesHandler = [
  FindAllEquipmentsQueryHandler
  
];
const CommandHandlers = [
  AddEquipmentCommandHandler,
  UpdateInstrumentCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Equipment', schema: EquipmentSchema },
      { name: 'EquipmentStateLogSchema', schema: EquipmentStateLogSchema },
    ]),
    UsersModule,
    QRModule,
    EmailModule,
    forwardRef(() => CertificateModule)
    
  ],
  providers: [
    EquipmentService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [EquipmentService,],
  controllers: [EquipmentController],
})
export class EquipmentModule {}
