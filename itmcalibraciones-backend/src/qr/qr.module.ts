import { Module } from '@nestjs/common';
import { QRController } from './qr.controller';
import { QRService } from './qr.service';

@Module({
  controllers: [QRController],
  providers: [QRService],
  exports: [QRService],
})
export class QRModule {}