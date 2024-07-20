import { Logger, Module } from '@nestjs/common';
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
        const logger = new Logger('BullModuleConfig');
        const environment = configService.get<string>('NODE_ENV');
        logger.log(`Current environment: ${environment}`);
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const redisOptions = {
          host: isProduction
            ? configService.get<string>('REDIS_HOST')
            : 'localhost',
          port: isProduction
            ? parseInt(configService.get<string>('REDIS_PORT'))
            : 6379,
          ...(isProduction && {
            password: configService.get<string>('REDIS_PASSWORD'),
          }),
        };

        return {
          redis: redisOptions,
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
