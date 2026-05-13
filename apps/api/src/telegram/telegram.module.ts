import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { RedisModule } from '../redis/redis.module'
import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
