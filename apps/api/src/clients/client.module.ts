import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { ClientController } from './client.controller'
import { ClientService } from './client.service'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientsModule {}
