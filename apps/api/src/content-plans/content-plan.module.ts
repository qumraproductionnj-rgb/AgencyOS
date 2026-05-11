import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AiModule } from '../ai/ai.module'
import { ContentPlanController } from './content-plan.controller'
import { ContentPlanService } from './content-plan.service'

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [ContentPlanController],
  providers: [ContentPlanService],
  exports: [ContentPlanService],
})
export class ContentPlansModule {}
