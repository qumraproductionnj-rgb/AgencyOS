import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CampaignController } from './campaign.controller'
import { CampaignService } from './campaign.service'

@Module({
  imports: [DatabaseModule],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignsModule {}
