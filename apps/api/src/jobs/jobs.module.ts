import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { DailyReportJob } from './daily-report.job'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DailyReportJob],
})
export class JobsModule {}
