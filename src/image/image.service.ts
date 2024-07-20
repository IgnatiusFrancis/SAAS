import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor(
    @InjectQueue('file-upload') private readonly fileUploadQueue: Queue,
  ) {}

  async addFileToQueue(userId: string, file: Express.Multer.File) {
    try {
      this.logger.verbose(`Adding image to queue`);

      // Add the job to the queue
      const job: Job = await this.fileUploadQueue.add(
        'upload',
        { userId, file },
        {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      const result = await job.finished();

      this.logger.verbose('Successfully processed file');
      return { Status: 'Successfully', result };
    } catch (error) {
      this.logger.error('Error while queuing file upload:', error.message);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
