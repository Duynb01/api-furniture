import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('File buffer is empty.');
    }
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folder || 'myshop' },
          (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new InternalServerErrorException('Upload failed'));
          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
