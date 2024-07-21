import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    });
    console.log(subscription);
    if (!subscription) {
      throw new ForbiddenException(
        'You must have an active subscription to access this resource.',
      );
    }

    return true;
  }
}
