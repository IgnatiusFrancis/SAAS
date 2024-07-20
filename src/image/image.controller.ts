import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/utils/guards/jwtAuth.guard';
import { CurrentUser } from 'src/utils/decorators';
import { User } from '@prisma/client';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imageService.addFileToQueue(user.id, file);
  }
}
