import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/utils/prisma';
import { AuthService } from 'src/auth/auth.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Status } from '@prisma/client';
import * as crypto from 'crypto';
import { Response } from 'express';

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

  public async handleWebhook(event: any, res: Response) {
    try {
      if (this.verifySignature(event)) {
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
        }

        res.status(200).send();
      } else {
        this.logger.error('Invalid webhook signature');
        res.status(400).send('Invalid signature');
      }
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  private verifySignature(req: Request): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');
    return hash === req.headers['x-paystack-signature'];
  }
}
