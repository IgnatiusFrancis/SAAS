import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/utils/decorators';
import { JwtGuard } from 'src/utils/guards/jwtAuth.guard';
import { Response } from 'express';

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(
    @CurrentUser() user: User,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    this.logger.verbose('Initializing subscription controller');
    return this.subscriptionService.initializeSubscription(
      user.id,
      createSubscriptionDto,
    );
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const event = req.body;
    this.logger.verbose('Received Paystack webhook', event);
    await this.subscriptionService.handleWebhook(event, res);
  }
}
