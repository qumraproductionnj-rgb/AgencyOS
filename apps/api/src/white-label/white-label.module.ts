import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { WhiteLabelService } from './white-label.service'
import { WhiteLabelController } from './white-label.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [WhiteLabelController],
  providers: [WhiteLabelService],
  exports: [WhiteLabelService],
})
export class WhiteLabelModule {}
