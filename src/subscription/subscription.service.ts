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
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRETKEY');
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
        amount: createSubscriptionDto.amount,
        plan: createSubscriptionDto.plan,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );

      this.logger.debug('Subscription initialized successfully');
      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error('Error response data:', error.response.data);
        throw new Error(`Paystack error: ${error.response.data.message}`);
      }
      this.logger.error('Error initializing subscription:', error.message);
      throw new Error('Error initializing subscription');
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

        const user = await this.authService.getUserByEmail(customer.email);
        if (user) {
          this.logger.debug(
            `About updating subscription details from processed webhook`,
          );
          await this.prisma.subscription.upsert({
            where: { subscriptionCode: subscription_code },
            update: {
              plan: plan.name,
              status,
              amount,
              nextPaymentDate: new Date(next_payment_date),
            },
            create: {
              subscriptionCode: subscription_code,
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
      } else if (event.event === 'subscription.update') {
        this.logger.debug(`Subscription update webhook received`);
        const { subscription_code, status, next_payment_date } = event.data;

        const subscription = await this.prisma.subscription.findUnique({
          where: { id: subscription_code },
        });

        if (subscription) {
          await this.prisma.subscription.update({
            where: { id: subscription_code },
            data: {
              status,
              nextPaymentDate: new Date(next_payment_date),
            },
          });
        }
      } else if (event.event === 'subscription.cancelled') {
        this.logger.debug(`Subscription cancellation webhook received`);
        const { subscription_code } = event.data;

        const subscription = await this.prisma.subscription.findUnique({
          where: { subscriptionCode: subscription_code },
        });

        if (subscription) {
          await this.prisma.subscription.update({
            where: { subscriptionCode: subscription_code },
            data: { status: 'cancelled' },
          });

          const user = await this.prisma.user.findUnique({
            where: { id: subscription.userId },
          });

          if (user) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { subscriptionActive: Status.Inactive },
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  public async cancelSubscription(subscriptionId: string) {
    try {
      this.logger.debug(`Cancelling subscription with Id: ${subscriptionId}`);

      const subscription = await this.prisma.subscription.findFirstOrThrow({
        where: { id: subscriptionId },
      });

      const url = `${this.baseUrl}/subscription/${subscription.subscriptionCode}/cancel`;
      const headers = { Authorization: `Bearer ${this.secretKey}` };

      const response = await firstValueFrom(
        this.httpService.post(url, {}, { headers }),
      );

      this.logger.debug(
        `Subscription cancelled successfully: ${response.data}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error cancelling subscription:', error.message);
      throw new Error(`Error cancelling subscription: ${error.message}`);
    }
  }
}
