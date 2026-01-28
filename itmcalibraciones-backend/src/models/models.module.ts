import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "@nestjs/mongoose";

import { AddModelCommandHandler } from "./commands/add-model.command";
import { UpdateModelCommandHandler } from "./commands/update-model.command";
import { ModelController } from "./models.controller";
import { ModelService } from "./models.service";
import { FindAllModelsQueryHandler } from "./queries/get-all-models.query";
import { ModelSchema } from "./schemas/model.schema";

const QueriesHandler = [FindAllModelsQueryHandler];
const CommandHandlers = [AddModelCommandHandler, UpdateModelCommandHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: "Model", schema: ModelSchema }]),
  ],
  providers: [ModelService, ...QueriesHandler, ...CommandHandlers],
  exports: [ModelService],
  controllers: [ModelController],
})
export class ModelModule {}
