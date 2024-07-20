import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/utils/prisma';
import { Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Processor('file-upload')
export class ImageProcessor {
  private readonly logger = new Logger(ImageProcessor.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  @Process('upload')
  async handleFileUpload(job: Job) {
    this.logger.verbose('image queue processing...');
    const { userId, file } = job.data;
    if (file.buffer && file.buffer.type === 'Buffer') {
      file.buffer = Buffer.from(file.buffer.data);
    }

    const result = await this.uploadToCloudinary(file);

    let image;
    if (result) {
      image = await this.prisma.image.create({
        data: {
          userId,
          url: result.secure_url,
          metadata: result,
        },
      });
    }
    this.logger.debug('image processing completed');
    return image;
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      if (!file.mimetype.startsWith('image')) {
        reject(new Error('Sorry, this file is not an image, please try again'));
        return;
      }

      const upload = v2.uploader.upload_stream(
        { folder: 'testFile' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
