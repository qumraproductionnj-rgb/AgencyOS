import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ContentPillarController } from './content-pillar.controller'
import { ContentPillarService } from './content-pillar.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ContentPillarController],
  providers: [ContentPillarService],
  exports: [ContentPillarService],
})
export class ContentPillarsModule {}
