import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { PlatformAuthController } from './platform-auth.controller'
import { PlatformAuthService } from './platform-auth.service'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PlatformAuthController],
  providers: [PlatformAuthService],
  exports: [PlatformAuthService],
})
export class PlatformAuthModule {}
