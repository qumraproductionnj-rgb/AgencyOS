import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ExternalWebhookService } from './external-webhook.service'
import { ExternalWebhookController } from './external-webhook.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [ExternalWebhookController],
  providers: [ExternalWebhookService],
  exports: [ExternalWebhookService],
})
export class ExternalWebhookModule {}
