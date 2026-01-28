import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import * as fs from "fs";
import { join } from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { IClient } from "src/clients/interfaces/client.interface";
import { EquipmentService } from "src/equipment/equipment.service";
import { IEquipment } from "src/equipment/interfaces/equipment.interface";
import { StatusEnum } from "src/errors-handler/enums/status.enum";
import { throwException } from "src/errors-handler/throw-exception";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { IOffice } from "src/offices/interfaces/office.interface";
import { AddCertificateCommand } from "./commands/certificate.command";
import { DeleteCertificateCommand } from "./commands/delete-certificate.command";
import { AddCertificateDTO } from "./dto/certificate.dto";
import { DeleteCertificateDTO } from "./dto/delete-certificate.dto";
import { GetCertificateDTO } from "./dto/get-certificate.dto";
import { ICertificate } from "./interfaces/certificate.interface";
import { FindCertificateQuery } from "./queries/get-certificate.query";
@Injectable()
export class CertificateService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly imageUploadService: ImageUploadService,
    @Inject(forwardRef(() => EquipmentService))
    private equipmentService: EquipmentService,
  ) {}

  async addCertificateWithWaterMark(
    addCertificateDTO: AddCertificateDTO,
    file: Express.Multer.File,
  ) {
    const localFilePath = join(process.cwd(), file.path);
    const { equipment } = addCertificateDTO;

    const params = {
      _id: equipment,
      populate: ["office.client"],
    };
    const equipmentData: IEquipment[] =
      await this.equipmentService.getAllEquipments(params);
    const socialReason = (
      (equipmentData[0].office as any as IOffice).client as any as IClient
    ).socialReason;

    const number = addCertificateDTO.number;
    const yearDate = addCertificateDTO.calibrationDate;
    const dateObject = new Date(yearDate);
    const year = dateObject.getFullYear().toString();
    const yearNumber = year.slice(2);

    try {
      // Add watermark to the PDF
      const fileName = `Certificado Nº ${yearNumber}-${number}.pdf`;
      const { watermarkedFilePath } =
        await this.imageUploadService.addWatermark(localFilePath, fileName);
      const destinationS3FilePath = `certificate/${socialReason}/${fileName}`;

      const uploadeLocation = await this.imageUploadService.uploadToS3(
        watermarkedFilePath,
        destinationS3FilePath,
      );

      // Delete the PDF from the temporary folder
      fs.unlinkSync(watermarkedFilePath);
      fs.unlinkSync(localFilePath);

      addCertificateDTO.certificate = uploadeLocation;
      equipmentData[0].certificate = uploadeLocation;
      const calibrationDate = new Date(addCertificateDTO.calibrationDate);
      const calibrationExpirationDate = new Date(
        addCertificateDTO.calibrationExpirationDate,
      );

      equipmentData[0].calibrationDate = calibrationDate;
      equipmentData[0].calibrationExpirationDate = calibrationExpirationDate;

      await equipmentData[0].save();
      return this.commandBus.execute(
        new AddCertificateCommand(addCertificateDTO),
      );
    } catch (error) {
      // Handle error
      console.error("Error uploading PDF:", error);
      throw new Error("Failed to upload and process the PDF");
    }
  }

  async addCertificate(addCertificateDTO: AddCertificateDTO, request) {
    // TODO: Save the PDF in local as tmp, put water mark, send to S3
    const { equipment } = addCertificateDTO;

    const params = {
      _id: equipment,
      populate: ["office.client"],
    };
    const equipmentData: IEquipment[] =
      await this.equipmentService.getAllEquipments(params);
    const socialReason = (
      (equipmentData[0].office as any as IOffice).client as any as IClient
    ).socialReason;
    const path = `certificate/${socialReason}`;

    try {
      // TODO: Algun dia arreglar esto
      const url = await this.imageUploadService.fileupload(request, path);
      addCertificateDTO.certificate = url;
      equipmentData[0].certificate = url;
    } catch (e) {
      // Si el archivo no viene en la request
      // Error y sigue.
      console.log(e);
    }

    equipmentData[0].calibrationDate = new Date(
      addCertificateDTO.calibrationDate,
    );
    equipmentData[0].calibrationExpirationDate = new Date(
      addCertificateDTO.calibrationExpirationDate,
    );

    await equipmentData[0].save();
    return this.commandBus.execute(
      new AddCertificateCommand(addCertificateDTO),
    );
  }

  async getCertificate(
    getCertificateDTO: GetCertificateDTO,
  ): Promise<ICertificate[]> {
    return this.queryBus.execute(new FindCertificateQuery(getCertificateDTO));
  }

  async deleteCertificate(
    deleteCertificate: DeleteCertificateDTO,
  ): Promise<ICertificate> {
    if (deleteCertificate.equipment && deleteCertificate.certificate) {
      if (
        deleteCertificate.equipment &&
        (deleteCertificate.equipment as IEquipment).certificate &&
        (deleteCertificate.equipment as IEquipment).certificate ===
          deleteCertificate.certificate
      ) {
        return throwException(StatusEnum.ERROR_DELETE_CERTIFICATE_UNDER_USING);
      }
    }
    deleteCertificate.deleted = true;
    return this.commandBus.execute(
      new DeleteCertificateCommand(deleteCertificate),
    );
  }

  async certificateUserAccess(
    user: JwtPayload,
    certificate: ICertificate,
  ): Promise<boolean> {
    const userOffice = user.office;
    return (
      (certificate.equipment as any as IEquipment).office?._id.toString() ===
      userOffice
    );
  }

  async cleanCertificateUserAccess(
    user: JwtPayload,
    certificates: ICertificate[],
  ): Promise<ICertificate[]> {
    return certificates.filter((c) => this.certificateUserAccess(user, c));
  }

  async addWatermarkToPDF(certificate, watermarkText) {
    // ALSO: https://www.npmjs.com/package/image-watermark
    // Cargar el archivo PDF existente
    const pdfDoc = await PDFDocument.load(certificate);

    // Obtener la fuente de texto estándar
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Obtener todas las páginas del PDF
    const pages = pdfDoc.getPages();

    // Iterar sobre cada página y agregar la marca de agua
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Definir la posición y tamaño de la marca de agua
      const textSize = 30;
      const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
      const textHeight = font.heightAtSize(textSize);
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      // Agregar el texto de la marca de agua a la página
      page.drawText(watermarkText, {
        x,
        y,
        size: textSize,
        font,
        //color: [0.5, 0.5, 0.5],
        opacity: 0.5,
      });
    }

    // Guardar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();

    return modifiedPdfBytes;
  }
}
