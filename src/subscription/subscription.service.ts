import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/utils/prisma';
import { AuthService } from 'src/auth/auth.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
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
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async handleWebhook(event: any) {
    try {
      if (
        event.event === 'subscription.create' ||
        event.event === 'subscription.update'
      ) {
        const { user_id, plan, status } = event.data;
        await this.prisma.subscription.create({
          data: {
            userId: user_id,
            plan,
            status,
          },
        });
        await this.prisma.user.update({
          where: { id: user_id },
          data: { subscriptionActive: status === 'active' },
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
