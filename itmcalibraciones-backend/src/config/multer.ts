import { HttpException, HttpStatus } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { extname } from 'path';
// Multer configuration
export const multerConfig = {
    dest: "./photo",
};

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3 = new AWS.S3({
    region: "us-east-2",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

// Multer upload options
export const multerOptions = {
    // Enable file size limits
    limits: {
        fileSize: 10000000,
    },
    // Check the mimetypes to allow for upload
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },

    storage: multerS3({
        s3: s3,
        bucket: "img2.itmcalibraciones.com",
        acl: 'public-read',
        key: function(request, file, cb) {
          cb(null, `${Date.now().toString()} - ${file.originalname}`);
        },
      }),
};