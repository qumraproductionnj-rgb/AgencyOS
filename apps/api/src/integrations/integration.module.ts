import { Module, Global } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { NotificationsModule } from '../notifications/notification.module'
import { IntegrationService } from './integration.service'
import { IntegrationController } from './integration.controller'

@Global()
@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
