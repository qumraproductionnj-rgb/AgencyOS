import { Module, Global } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
