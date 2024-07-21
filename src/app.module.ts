import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './utils';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './utils/interceptors/user.interceptor';
import { AllExceptionsFilter } from './utils/filters/httpExceptionFilter';
import { JwtAuthService } from './utils/token.generators';
import { SubscriptionModule } from './subscription/subscription.module';
import { ImageModule } from './image/image.module';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    SubscriptionModule,
    ImageModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const redisOptions = {
          host: 'localhost',
          port: 6379,
        };

        return {
          redis: isProduction
            ? `redis://:${configService.get<string>(
                'REDIS_PASSWORD',
              )}@${configService.get<string>(
                'REDIS_HOST',
              )}:${configService.get<string>('REDIS_PORT')}`
            : redisOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
