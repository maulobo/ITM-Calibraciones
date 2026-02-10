import { Injectable, Req } from "@nestjs/common";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import multer from "multer";
import multerS3 from "multer-s3";
import * as path from "path";
import { Color, PDFDocument, PDFPage, degrees, grayscale } from "pdf-lib";

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "img2.itmcalibraciones.com";
const s3 = new AWS.S3({
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const r3 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

@Injectable()
export class ImageUploadService {
  constructor() {}

  async fileupload(@Req() req, path: string) {
    try {
      console.log(req.files);
      const uploadMiddleware = this.upload(path); // Create a middleware function

      // Wrap the middleware function in a promise
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, null, (error: any) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve();
          }
        });
      });

      return req.files[0].location;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async uploadDatasheet(@Req() req) {
    try {
      const uploadMiddleware = this.uploadR2("datasheets");

      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, null, (error: any) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve();
          }
        });
      });
      // R2 usually returns the location, but if not we might construct it. 
      // multer-s3 should populate `location`.
      return req.files[0].location;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  upload = (path: string) =>
    multer({
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        acl: "public-read",
        key: (req, file, cb) => {
          const key = `${path}/${Date.now().toString()} - ${file.originalname}`;
          cb(null, key);
        },
      }),
    }).array("upload", 1);

  uploadR2 = (path: string) =>
    multer({
      storage: multerS3({
        s3: r3,
        bucket: R2_BUCKET_NAME,
        // acl: "public-read", // R2 doesn't support ACLs like S3. Ensure bucket is public or use presigned.
        key: (req, file, cb) => {
          const key = `${path}/${Date.now().toString()}-${file.originalname}`;
          cb(null, key);
        },
      }),
    }).array("file", 1); // Expecting field name 'file' for R2 uploads


  async uploadToS3(filePath: string, destinationPath: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath);

      const params: AWS.S3.PutObjectRequest = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: destinationPath,
        Body: fileContent,
        ACL: "public-read",
      };

      const result = await s3.upload(params).promise();

      return result.Location;
    } catch (error) {
      // Handle error
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  async addWatermark(
    filePath: string,
    fileName: string,
  ): Promise<{
    filePath: string;
    watermarkedFilePath: string;
    fileName: string;
  }> {
    try {
      const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));

      const watermarkText = "Copia de Calibraciones ITM S.A."; // Watermark text
      const watermarkFontSize = 42; // Font size of the watermark
      const watermarkColor: Color = grayscale(0.5); // RGB color of the watermark (gray)

      const pages = pdfDoc.getPages();

      for (const page of pages) {
        this.addTextWatermark(
          page,
          watermarkText,
          watermarkFontSize,
          watermarkColor,
        );
      }

      const watermarkedFilePath = path.join(
        path.dirname(filePath),
        `${fileName}`,
      );

      const modifiedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(watermarkedFilePath, modifiedPdfBytes);

      return { filePath, watermarkedFilePath, fileName: `${fileName}` };
    } catch (error) {
      // Handle error
      console.error("Error adding watermark:", error);
      throw new Error("Failed to add watermark to the PDF");
    }
  }

  private addTextWatermark(
    page: PDFPage,
    text: string,
    fontSize: number,
    color: Color,
  ) {
    const { width, height } = page.getSize();

    page.drawText(text, {
      x: width / 2 - 230,
      y: height / 2 - 140,
      size: fontSize,
      color: color,
      opacity: 0.3,
      rotate: degrees(40),
    });
  }
}
