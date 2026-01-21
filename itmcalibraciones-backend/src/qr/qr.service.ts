import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';

@Injectable()
export class QRService {
  async generateQRCode(url: string): Promise<string> {
    try {
      // Genera el código QR
      const qrCode = await qrcode.toDataURL(url);
      
      // Devuelve el código QR en formato base64
      return qrCode;
    } catch (error) {
      throw new Error('Error al generar el código QR');
    }
  }
}