import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AddOfficeCommandHandler } from './commands/add-or-update-office.command';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';
import { FindAllOfficesQueryHandler } from './queries/get-all-offices.query';
import { OfficeSchema } from './schemas/office.schema';


const QueriesHandler = [
  FindAllOfficesQueryHandler
];
const CommandHandlers = [
  AddOfficeCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Office', schema: OfficeSchema },
    ])
  ],
  providers: [
    OfficeService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [OfficeService,],
  controllers: [OfficeController],
})
export class OfficesModule {}
