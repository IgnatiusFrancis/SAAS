import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/utils/decorators';
import { JwtGuard } from 'src/utils/guards/jwtAuth.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(
    @CurrentUser() user: User,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.initializeSubscription(
      user.id,
      createSubscriptionDto,
    );
  }

  // @Post('webhook')
  // async webhook(@Req() req: any) {
  //   const event = req.body;
  //   await this.subscriptionService.handleWebhook(event);
  // }
}
