import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { MarkReadSchema, type MarkReadDto } from './notification.dto'
import { NotificationService } from './notification.service'

@ApiTags('notifications')
@Controller()
export class NotificationController {
  constructor(private readonly notification: NotificationService) {}

  @Get('v1/notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List notifications for current user' })
  @RequireTier('TENANT')
  async findAll(
    @Query('unreadOnly') unreadOnly: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.notification.findAll(user.companyId!, user.sub, {
      ...(unreadOnly !== undefined ? { unreadOnly: true } : {}),
      ...(limit !== undefined ? { limit: Number(limit) } : {}),
      ...(cursor !== undefined ? { cursor } : {}),
    })
  }

  @Get('v1/notifications/unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  @RequireTier('TENANT')
  async unreadCount(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.notification.getUnreadCount(user.companyId!, user.sub)
    return { count }
  }

  @Patch('v1/notifications/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notifications as read' })
  @RequireTier('TENANT')
  async markRead(
    @Body(new ZodValidationPipe(MarkReadSchema)) dto: MarkReadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.notification.markRead(user.companyId!, user.sub, dto.ids)
    return { status: 'ok' }
  }

  @Patch('v1/notifications/read-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @RequireTier('TENANT')
  async markAllRead(@CurrentUser() user: CurrentUserPayload) {
    await this.notification.markAllRead(user.companyId!, user.sub)
    return { status: 'ok' }
  }

  @Delete('v1/notifications/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.notification.remove(user.companyId!, user.sub, id)
    return { status: 'deleted' }
  }
}
