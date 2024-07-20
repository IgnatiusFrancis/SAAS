import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/utils/prisma';

@Processor('file-upload')
export class ImageProcessor {
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
  async handleFileUpload(
    job: Job<{ userId: string; file: Express.Multer.File }>,
  ) {
    const { userId, file } = job.data;
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
