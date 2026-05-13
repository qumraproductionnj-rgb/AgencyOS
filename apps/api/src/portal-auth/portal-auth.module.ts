import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { PortalAuthController } from './portal-auth.controller'
import { PortalAuthService } from './portal-auth.service'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [PortalAuthController],
  providers: [PortalAuthService],
  exports: [PortalAuthService],
})
export class PortalAuthModule {}
