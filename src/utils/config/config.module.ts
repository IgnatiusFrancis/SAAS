import { Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.string().required(),
        CLOUDINARY_NAME: Joi.string().required(),
        PAYSTACK_BASEURL: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        PAYSTACK_SECRETKEY: Joi.string().required(),
        PLAN: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
