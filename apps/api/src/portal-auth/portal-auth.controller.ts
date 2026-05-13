import { Body, Controller, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Public } from '../common/decorators/public.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { PortalAuthService } from './portal-auth.service'
import {
  PortalLoginSchema,
  PortalRefreshSchema,
  PortalForgotPasswordSchema,
  PortalResetPasswordSchema,
  type PortalLoginDto,
  type PortalRefreshDto,
  type PortalForgotPasswordDto,
  type PortalResetPasswordDto,
} from './portal-auth.dto'
import type { DeviceInfo } from '../auth/services/session.service'

@ApiTags('portal-auth')
@Controller({ path: 'portal/auth', version: '1' })
@Public()
export class PortalAuthController {
  constructor(private readonly auth: PortalAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client portal login → access + refresh tokens' })
  @UsePipes(new ZodValidationPipe(PortalLoginSchema))
  async login(@Body() dto: PortalLoginDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    const result = await this.auth.login(dto, ctx)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString(),
      userId: result.userId,
      clientId: result.clientId,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token for portal user' })
  @UsePipes(new ZodValidationPipe(PortalRefreshSchema))
  async refresh(@Body() dto: PortalRefreshDto, @Req() req: Request) {
    const ctx = this.contextFrom(req)
    const result = await this.auth.refresh(dto, ctx)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString(),
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke portal session' })
  async logout(@Body() body: { refreshToken: string }) {
    await this.auth.logout(body.refreshToken)
    return { message: 'Logged out' }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset for portal' })
  @UsePipes(new ZodValidationPipe(PortalForgotPasswordSchema))
  async forgotPassword(@Body() dto: PortalForgotPasswordDto) {
    await this.auth.forgotPassword(dto)
    return { message: 'If an account exists for that email, a reset link has been sent' }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password using reset token' })
  @UsePipes(new ZodValidationPipe(PortalResetPasswordSchema))
  async resetPassword(@Body() dto: PortalResetPasswordDto) {
    await this.auth.resetPassword(dto)
    return { message: 'Password reset — please log in again' }
  }

  private contextFrom(req: Request): { ipAddress: string | null; deviceInfo: DeviceInfo | null } {
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
