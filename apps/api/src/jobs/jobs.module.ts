import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { DailyReportJob } from './daily-report.job'
import { EmailSequencesJob } from './email-sequences.job'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DailyReportJob, EmailSequencesJob],
  exports: [EmailSequencesJob],
})
export class JobsModule {}
