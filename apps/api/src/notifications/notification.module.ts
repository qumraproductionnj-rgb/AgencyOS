import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { TelegramModule } from '../telegram/telegram.module'
import { NotificationController } from './notification.controller'
import { NotificationGateway } from './notification.gateway'
import { NotificationService } from './notification.service'

@Module({
  imports: [DatabaseModule, TelegramModule],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}
