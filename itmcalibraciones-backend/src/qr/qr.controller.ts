import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { QRService } from './qr.service';

@Controller('qr')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  @Get('/generate')
  async generateQR(
    @Query('url') url: string, 
    @Res() res: Response
){
    try {
      // Genera el código QR a partir de la URL
      const qrCode = await this.qrService.generateQRCode(url);
      // Envía la respuesta como una imagen PNG
      res.setHeader('Content-Type', 'image/png');
      res.send(Buffer.from(qrCode.replace('data:image/png;base64,', ''), 'base64'));
    } catch (error) {
      // Maneja el error en caso de que ocurra algún problema
      res.status(500).json({ error: 'Error al generar el código QR' });
    }
  }
}