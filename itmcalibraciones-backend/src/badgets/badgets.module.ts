import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BadgetController } from './badgets.controller';
import { BadgetService } from './badgets.service';

import { AddBadgetCommandHandler } from './commands/add-badgets.command';
import { ResetBadgetCounterCommandHandler } from './commands/reset-badget-counter.command';
import { UpdateBadgetCommandHandler } from './commands/update-badgets.command';
import { FindAllBadgetsQueryHandler } from './queries/get-all-badgets.query';
import { badgetSchemaProvier } from './schemas/badget.schema.provider';


const QueriesHandler = [
  FindAllBadgetsQueryHandler,

  
];
const CommandHandlers = [
  AddBadgetCommandHandler,
  UpdateBadgetCommandHandler,
  ResetBadgetCounterCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeatureAsync([
      badgetSchemaProvier,
    ]),
    // MongooseModule.forFeature([
    //   { name: 'BadgetNormal', schema: BadgetSchema },
    // ]),
  ],
  providers: [
    BadgetService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [BadgetService,],
  controllers: [BadgetController],
})
export class BadgetsModule {}
