import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PaystackService } from './paystack.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/utils/prisma';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthService } from 'src/utils/token.generators';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    PaystackService,
    PrismaService,
    AuthService,
    JwtAuthService,
  ],
})
export class SubscriptionModule {}
