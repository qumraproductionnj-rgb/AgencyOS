import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'
import { SessionService } from './services/session.service'
import { EmailService } from './services/email.service'
import { VerificationService } from './services/verification.service'
import { PermissionModule } from '../permissions/permission.module'

@Module({
  imports: [PermissionModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    SessionService,
    EmailService,
    VerificationService,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    SessionService,
    EmailService,
    VerificationService,
  ],
})
export class AuthModule {}
