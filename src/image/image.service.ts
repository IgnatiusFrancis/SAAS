import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from 'src/utils/prisma';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(userId: string, file: Express.Multer.File) {
    const result = await cloudinary.uploader.upload(file.path);
    const image = await this.prisma.image.create({
      data: {
        userId,
        url: result.secure_url,
        metadata: result,
      },
    });
    return image;
  }
}
