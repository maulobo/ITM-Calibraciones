import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailModule } from 'src/email/email.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { UsersModule } from 'src/users/users.module';
import { AddInformCommandHandler } from './commands/add-inform.command';
import { FindInformsQueryyHandler } from './queries/get-all-informs.query';
import { TechnicalInformSchema } from './schemas/technical-inform.schema';
import { TechnicalInformController } from './technical-inform.controller';
import { TechnicalInformService } from './technical-inform.service';


const QueriesHandler = [
  FindInformsQueryyHandler
];
const CommandHandlers = [
  AddInformCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'TechnicalInforms', schema: TechnicalInformSchema },
    ]),
    EquipmentModule,
    EmailModule,
    UsersModule
  ],
  providers: [
    TechnicalInformService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [TechnicalInformService],
  controllers: [TechnicalInformController],
})
export class TechnicalInformModule {}
