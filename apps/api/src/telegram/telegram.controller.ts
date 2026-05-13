import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'

@Controller('api/v1/telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  @RequireTier('TENANT')
  async getStatus(@CurrentUser() user: CurrentUserPayload) {
    return this.telegramService.getStatus(user.sub)
  }

  @Post('link')
  @RequireTier('TENANT')
  async generateLink(@CurrentUser() user: CurrentUserPayload) {
    return this.telegramService.generateLinkToken(user.sub)
  }

  @Delete('unlink')
  @RequireTier('TENANT')
  async unlink(@CurrentUser() user: CurrentUserPayload) {
    await this.telegramService.unlink(user.sub)
    return { message: 'Telegram unlinked successfully' }
  }
}
