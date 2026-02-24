import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientController } from './clients.controller';
import { ClientService } from './clients.service';
import { AddClientCommandHandler } from './commands/add-update-client.command';
import { FindClientsQueryHandler } from './queries/find-clients.query';
import { FindAllClientsQueryHandler } from './queries/get-all-clients.query';
import { ClientsSchema } from './schemas/clients.schema';
import { ServiceOrderSchema } from '../service-orders/schemas/service-order.schema';


const QueriesHandler = [
  FindClientsQueryHandler,
  FindAllClientsQueryHandler
 
];
const CommandHandlers = [
  AddClientCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Client', schema: ClientsSchema },
      { name: 'ServiceOrder', schema: ServiceOrderSchema },
    ])
  ],
  providers: [
    ClientService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [ClientService,],
  controllers: [ClientController],
})
export class ClientsModule {}
