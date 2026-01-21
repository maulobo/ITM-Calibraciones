import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Claro App Backend')
    .setDescription('Main API DOC')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          `
            User: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsImVtYWlsIjoidXNlckB1c2VyLmNvbSIsImlkIjoiNjNjZWY2OGVmMjkzMDIzNTBkMGJhNTIyIiwicm9sZXMiOlsiVVNFUiJdLCJldmVudHMiOlsiNjNjZWY3ODBhOWE4ZmZiM2YwNTVlNmE2Il0sImlhdCI6MTY3NDc0NzU1NSwiZXhwIjoxNjc0ODMzOTU1fQ.HurbIrBpO9AUbhg-wqZU4aPLWYnOUcg7C0abNNo1wlc
            Admin: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlkIjoiNjNjZWY3NWJhOWE4ZmZiM2YwNTVlNmE0Iiwicm9sZXMiOlsiQURNSU4iXSwiZXZlbnRzIjpbIjYzY2VmNzgwYTlhOGZmYjNmMDU1ZTZhNiJdLCJpYXQiOjE2NzQ3NDc0NjUsImV4cCI6MTY3NDgzMzg2NX0.d7ehnsDx6b1EN36anoE22vDPZ7atEf1kX94sW2H-7Aw
          `,
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //SwaggerModule.setup('doc', app, document);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.enableCors({
   origin: [
    'https://app.itmcalibraciones.com',
    'https://www.app.itmcalibraciones.com',
    'http://localhost:3000',
  ],
    methods: ["GET", "POST", "PATCH", "PUT"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(parseInt(process.env.APP_PORT, 10), () => {
    console.log(`Nest running on port ${process.env.APP_PORT} --- :)`);
  });
}
bootstrap();