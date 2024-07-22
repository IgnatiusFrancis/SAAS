import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../utils/prisma';
import { AuthService } from '../auth/auth.service';
import { JwtAuthService } from '../utils/token.generators';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 3000,
        maxRedirects: 2,
      }),
    }),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, AuthService, JwtAuthService],
})
export class SubscriptionModule {}
