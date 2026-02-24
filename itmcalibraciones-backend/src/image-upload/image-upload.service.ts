import { Injectable, Req } from "@nestjs/common";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import multer from "multer";
import multerS3 from "multer-s3";
import * as path from "path";
import { Color, PDFDocument, PDFPage, degrees, grayscale } from "pdf-lib";

@Injectable()
export class ImageUploadService {
  private s3: AWS.S3;
  private r2: AWS.S3;
  private s3BucketName: string;
  private r2BucketName: string;

  constructor() {
    this.s3BucketName =
      process.env.AWS_S3_BUCKET_NAME || "img2.itmcalibraciones.com";
    this.r2BucketName = process.env.R2_BUCKET_NAME;

    this.s3 = new AWS.S3({
      region: "us-east-2",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.r2 = new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      signatureVersion: "v4",
    });
  }

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
          // Si el archivo es demasiado grande, multer devuelve error con code
          if (error) {
            console.log("Error en subida:", error);
            if (error.code === "LIMIT_FILE_SIZE") {
              reject(new Error("El archivo es demasiado pesado (Max 10MB)"));
            } else {
              reject(error);
            }
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

  upload(path: string) {
    return multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.s3BucketName,
        acl: "public-read",
        key: (req, file, cb) => {
          const key = `${path}/${Date.now().toString()} - ${file.originalname}`;
          cb(null, key);
        },
      }),
    }).array("upload", 1);
  }

  uploadR2(path: string) {
    return multer({
      limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
      storage: multerS3({
        s3: this.r2,
        bucket: this.r2BucketName,
        // acl: "public-read", // R2 doesn't support ACLs like S3. Ensure bucket is public or use presigned.
        key: (req, file, cb) => {
          const key = `${path}/${Date.now().toString()}-${file.originalname}`;
          cb(null, key);
        },
      }),
    }).array("file", 1); // Expecting field name 'file' for R2 uploads
  }

  async uploadToS3(filePath: string, destinationPath: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath);

      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.s3BucketName,
        Key: destinationPath,
        Body: fileContent,
        ACL: "public-read",
      };

      const result = await this.s3.upload(params).promise();

      return result.Location;
    } catch (error) {
      // Handle error
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  async deleteFileR2(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract Key from URL
      // URL format: https://.../datasheets/timestamp-filename
      const urlParts = fileUrl.split("/");
      // Assuming structure is endpoint/bucket/datasheets/file OR custom-domain/datasheets/file
      // We need to look for where "datasheets" starts
      const keyIndex = urlParts.indexOf("datasheets");
      if (keyIndex === -1) {
        console.warn("Could not extract key from URL for deletion:", fileUrl);
        return;
      }
      const key = urlParts.slice(keyIndex).join("/");

      await this.r2
        .deleteObject({
          Bucket: this.r2BucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error("Error deleting file from R2:", error);
      // We don't throw here to allow the DB update to proceed even if file deletion fails
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
