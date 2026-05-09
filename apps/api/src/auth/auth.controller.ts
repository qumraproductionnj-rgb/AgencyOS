import { Body, Controller, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Public } from '../common/decorators/public.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'
import {
  ForgotPasswordSchema,
  LoginSchema,
  LogoutSchema,
  RefreshSchema,
  ResetPasswordSchema,
  SignupSchema,
  VerifyEmailSchema,
  type ForgotPasswordDto,
  type LoginDto,
  type LogoutDto,
  type RefreshDto,
  type ResetPasswordDto,
  type SignupDto,
  type VerifyEmailDto,
} from './dto/auth.dto'
import type { DeviceInfo } from './services/session.service'

interface AuthContext {
  ipAddress: string | null
  deviceInfo: DeviceInfo | null
}

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
@Public()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create company + owner user, send verification email' })
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() dto: SignupDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    const result = await this.auth.signup(dto, ctx)
    return {
      message: 'Signup successful — verification email sent',
      companyId: result.companyId,
      userId: result.userId,
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm email via single-use token' })
  @UsePipes(new ZodValidationPipe(VerifyEmailSchema))
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.auth.verifyEmail(dto)
    return { message: 'Email verified' }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tenant user login → access + refresh tokens' })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    const result = await this.auth.login(dto, ctx)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString(),
      userId: result.userId,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token + return new access token' })
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    const result = await this.auth.refresh(dto.refreshToken, ctx)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString(),
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token / session' })
  @UsePipes(new ZodValidationPipe(LogoutSchema))
  async logout(@Body() dto: LogoutDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    await this.auth.logout(dto.refreshToken, ctx)
    return { message: 'Logged out' }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email (always 200 to prevent enumeration)' })
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    await this.auth.forgotPassword(dto, ctx)
    return { message: 'If an account exists for that email, a reset link has been sent' }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password using reset token; revokes all sessions' })
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    await this.auth.resetPassword(dto, ctx)
    return { message: 'Password reset — please log in again' }
  }

  private contextFrom(req: Request): AuthContext {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.ip ??
      null
    const userAgent = req.headers['user-agent'] ?? undefined
    return {
      ipAddress: ipAddress ?? null,
      deviceInfo: userAgent !== undefined ? { userAgent } : null,
    }
  }
}
