import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BadgetsModule } from "./badgets/badgets.module";
import { BrandsModule } from "./brands/brands.module";
import { CertificateModule } from "./certificates/certificate.module";
import { CityModule } from "./city/city.module";
import { ClientsModule } from "./clients/clients.module";
import { EquipmentCardsModule } from "./equipment-card/equipment-card.module";
import { EquipmentTypesModule } from "./equipment-types/equipment-types.module";
import { EquipmentModule } from "./equipment/equipment.module";
import { AllExceptionFilter } from "./errors-handler/exeptions-filter";
import { ImageUploadModule } from "./image-upload/image-upload.module";
import { ImportsModule } from "./imports/imports.module";
import { ModelModule } from "./models/models.module";
import { OfficesModule } from "./offices/offices.module";
import { PdfGeneratorModule } from "./pdf-generator/pdf-generator.module";
import { QRModule } from "./qr/qr.module";
import { ServiceOrdersModule } from "./service-orders/service-orders.module";
import { TechnicalInformModule } from "./technical-inform/technical-inform.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "files"),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>("MONGO_URL");
        console.log(
          "🔍 DEBUG: Attempting to connect to MongoDB with URL:",
          mongoUrl,
        );
        return {
          uri: mongoUrl,
          autoIndex: true,
        };
      },
      inject: [ConfigService],
    }),

    ImageUploadModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    OfficesModule,
    BrandsModule,
    ModelModule,
    EquipmentTypesModule,
    EquipmentModule,
    EquipmentCardsModule,
    CityModule,
    TechnicalInformModule,
    CertificateModule,
    PdfGeneratorModule,
    QRModule,
    BadgetsModule,
    ImportsModule,
    ServiceOrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
