import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ClientController } from './client.controller'
import { ClientService } from './client.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientsModule {}
