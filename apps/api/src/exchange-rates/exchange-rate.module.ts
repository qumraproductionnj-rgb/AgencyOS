import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from '../database/database.module'
import { ExchangeRateController } from './exchange-rate.controller'
import { ExchangeRateService } from './exchange-rate.service'

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRatesModule {}
