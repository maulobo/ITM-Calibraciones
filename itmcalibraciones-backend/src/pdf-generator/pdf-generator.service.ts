import { Injectable } from '@nestjs/common';

import { encode } from 'node-base64-image';
import * as path from 'path';
import { VatLabels } from 'src/badgets/enum/vat.enum';
import { IBadget } from 'src/badgets/interfaces/badgets.interface';
import { ICity } from 'src/city/interfaces/city.interface';
import { IState } from 'src/city/interfaces/state.interface';
import { IClient } from 'src/clients/interfaces/client.interface';
import { dateToEsString } from 'src/common/utils/common-functions';
import { IOffice } from 'src/offices/interfaces/office.interface';
import { IUser } from 'src/users/interfaces/user.interface';
import { GeneratePDFStickerDTO } from './dto/sticker.dto';
import { GeneratePDFTechnicalInformDTO } from './dto/technical-inform.dto';
import { createPdf } from './pdf-generator';

const fs = require('fs');
@Injectable()
export class PdfGeneratorService {
  constructor() {}

  secondExample() {
    const data = {
    title: 'My PDF file',
    status: 'paid',
    invoiceId: '#123-123',
    customerName: 'Saúl Escandón',
    customerAddress: '1234 Main St',
    customerCity: 'Huánuco',
    customerState: 'Huánuco',
    customerCountry: 'Perú',
    customerPhone: '555-555-5555',
    items: [
            {
            description: 'custom suit',
            detail: {
                color: 'blue',
                size: '42',
            },
            price: {
                price0: 1500.0,
                price: 1050.0,
                save: 25,
            },
            quantity: 1,
            image:
                'https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/new/img(4).webp',
            },
            {
            description: 'playstation 5',
            detail: {
                color: 'white',
                size: '45cmx45cm',
            },
            price: {
                price0: 500.0,
                price: 250.0,
                save: 50,
            },
            quantity: 2,
            image:
                'https://promart.vteximg.com.br/arquivos/ids/931599-1000-1000/image-b08a9ed36e114598bc56d7d4a5e7dd2d.jpg?v=637569550232800000',
            },
      ],
      subTotal: 1550.0,
      shipping: 15.0,
      total: 1565.0,
    };
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '25mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `<div style="width: 100%; text-align: center;"><span style="font-size: 20px;">@saemhco CORP</span><br><span class="date" style="font-size:15px"><span></div>`,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      landscape: true,
    };
    const filePath = path.join(process.cwd(), 'src/pdf-generator/templates', 'invoice.hbs');;
    return createPdf(filePath, options, data);
}

  async badget(badget: IBadget) {
    const { date, showTotal, number, advisor, year, office, user, attention, reference, deliveryTime, offerValidity, paymentTerms, currency, vat, details, notes} = badget

    const vatLabel = VatLabels[vat]
    
    const dateFormated = `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;  
    const {socialReason, cuit } = ((office as any as IOffice).client as any as IClient)
    const {adress , city} = office as any as IOffice
    const { nombre: state } = (city as any as ICity).state as any as  IState
    const cityName = (city as any as ICity).name
    const dateString = dateToEsString(date)
    
    const at = user ? (user as any as IUser).name + " " + (user as any as IUser).lastName : attention

    const newDetails = details.reverse().map( (d, index) => { return { 
        intemNumber: index +1 ,
        description: d.description, 
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        discount: d.discount,
        totalPrice: d.totalPrice,
      }}
    )

    const total = details.reduce((total, item) => {
      return total + item.totalPrice;
    }, 0);

    const advisorName = (advisor as any as IUser).name + " " + (advisor as any as IUser).lastName

    const data = {
      title: `Presupuesto Nº ${year}-${number}`,
      dateString,
      dateFormated,
      adress,
      state,
      cityName,
      socialReason,
      at,
      reference,
      deliveryTime,
      offerValidity,
      paymentTerms,
      currency,
      vatLabel,
      newDetails,
      notes,
      total,
      showTotal,
      cuit,
      advisor: advisorName
    };

    const pageConfig = await this.pageConfig()
    const filePath = path.join(process.cwd(), 'src/pdf-generator/templates', 'badget.hbs');
    
    return await createPdf(filePath, pageConfig, data);
  }
  
  private pageConfig = async () => {
    const logoB64 = await encode('https://i.ibb.co/jJs4c2S/foot.png', {
      string: true,
      headers: {
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
      }
    });

    const pageConfig = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: { top: 0, bottom: 0, right: 0, left: 0 },
      landscape: false,
      headerTemplate: `<div></div>`,
      footerTemplate:
        `<div style="display:block;margin-bottom:-20px; width:100%"><img src="data:image/png;base64,${logoB64}" style="width:100%"></div>`,
    };

    return pageConfig

  }

  async TechnicalInform(generatePDFTechnicalInformDTO: GeneratePDFTechnicalInformDTO) {
    const { date, comments, dateString, descriptions, serialNumber, model, instrumentType, office, client} = generatePDFTechnicalInformDTO

    const pageConfig = await this.pageConfig()

    const data = {
      title: 'Informe técnico',
      date,
      comments,
      descriptions,
      serialNumber,
      model,
      instrumentType,
      dateString,
      office: office.name,
      client: client.socialReason
    };
    
    
    const filePath = path.join(process.cwd(), 'src/pdf-generator/templates', 'Technical-inform.hbs');;
    
    return createPdf(filePath, pageConfig, data);
  }

  async sticker(generatePDFStickerDTO: GeneratePDFStickerDTO) {
    const { day, month, year, serialNumber, qr} = generatePDFStickerDTO
    
    const data = {
      title: 'Sticker',
      day, month, year, serialNumber, qr
    };
    
    const options = {
      format: 'A4',
      displayHeaderFooter: false,
      margin: {
        left: '10mm',
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
      },
      landscape: false,
    };
  
    const filePath = path.join(process.cwd(), 'src/pdf-generator/templates', 'stickers.hbs');;
      
    return createPdf(filePath, options, data);
  }
}

