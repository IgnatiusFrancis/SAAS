import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ImageService {
  constructor(
    @InjectQueue('file-upload') private readonly fileUploadQueue: Queue,
  ) {}

  async addFileToQueue(userId: string, file: Express.Multer.File) {
    await this.fileUploadQueue.add('upload', { userId, file });
  }
}
