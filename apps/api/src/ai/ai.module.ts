import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AiController } from './ai.controller'
import { AiGenerationService } from './ai-generation.service'

@Module({
  imports: [DatabaseModule],
  controllers: [AiController],
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiModule {}
