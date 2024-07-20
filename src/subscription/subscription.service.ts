import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/utils/prisma';
import { AuthService } from 'src/auth/auth.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Status } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('PAYSTACK_BASEURL');
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  public async initializeSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ) {
    try {
      this.logger.debug('Initializing subscription starting...');
      const user = await this.authService.getUserById(userId);
      const url = `${this.baseUrl}/transaction/initialize`;
      const headers = { Authorization: `Bearer ${this.secretKey}` };
      const data = {
        email: user.email,
        plan: createSubscriptionDto.plan,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );
      this.logger.debug('Initializing subscription successfully');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async handleWebhook(event: any) {
    try {
      if (event.event === 'subscription.create') {
        this.logger.debug(
          `Webhook received and about to process: ${event.event}`,
        );
        const {
          subscription_code,
          status,
          amount,
          plan,
          customer,
          next_payment_date,
        } = event.data;

        // Retrieve user by customer email
        const user = await this.prisma.user.findUnique({
          where: { email: customer.email },
        });

        if (user) {
          this.logger.debug(
            `About updating subscription details from processed webhook`,
          );
          await this.prisma.subscription.upsert({
            where: { id: subscription_code },
            update: {
              plan: plan.name,
              status,
              amount,
              nextPaymentDate: new Date(next_payment_date),
            },
            create: {
              id: subscription_code,
              userId: user.id,
              plan: plan.name,
              status,
              amount,
              nextPaymentDate: new Date(next_payment_date),
            },
          });

          this.logger.debug(
            `About updating user details from processed webhook`,
          );
          await this.prisma.user.update({
            where: { id: user.id },
            data: { subscriptionActive: Status.Active },
          });
        }

        this.logger.debug(`Successfully updated all fields`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }
}
