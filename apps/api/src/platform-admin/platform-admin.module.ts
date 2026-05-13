import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PlatformAdminService } from './platform-admin.service'
import { PlatformAdminController } from './platform-admin.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
  exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
