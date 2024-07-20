import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from 'src/utils/prisma';
import { JwtAuthService } from 'src/utils/token.generators';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    BullModule.registerQueue({
      name: 'file-upload',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, PrismaService, JwtAuthService],
})
export class ImageModule {}
