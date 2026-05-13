import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { NotificationsModule } from '../notifications/notification.module'
import { LifecycleService } from './lifecycle.service'
import { LifecycleController } from './lifecycle.controller'

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot(), AuthModule, NotificationsModule],
  controllers: [LifecycleController],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
