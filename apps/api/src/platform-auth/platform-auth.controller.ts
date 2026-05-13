import { Body, Controller, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common'
import type { Request } from 'express'
import { Public } from '../common/decorators/public.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { PlatformAuthService } from './platform-auth.service'
import {
  PlatformLoginSchema,
  PlatformRefreshSchema,
  type PlatformLoginDto,
  type PlatformRefreshDto,
} from './platform-auth.dto'

@Controller({ path: 'platform/auth', version: '1' })
@Public()
export class PlatformAuthController {
  constructor(private readonly auth: PlatformAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(PlatformLoginSchema))
  async login(@Body() dto: PlatformLoginDto, @Req() req: Request) {
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
  @UsePipes(new ZodValidationPipe(PlatformRefreshSchema))
  async refresh(@Body() dto: PlatformRefreshDto, @Req() req: Request) {
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
  async logout(@Body() body: { refreshToken: string }) {
    await this.auth.logout(body.refreshToken)
    return { message: 'Logged out' }
  }

  private contextFrom(req: Request) {
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
