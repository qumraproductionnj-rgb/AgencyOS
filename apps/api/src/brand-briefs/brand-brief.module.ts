import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { BrandBriefController } from './brand-brief.controller'
import { BrandBriefService } from './brand-brief.service'

@Module({
  imports: [DatabaseModule],
  controllers: [BrandBriefController],
  providers: [BrandBriefService],
  exports: [BrandBriefService],
})
export class BrandBriefsModule {}
