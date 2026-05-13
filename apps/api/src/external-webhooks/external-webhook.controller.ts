import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { ExternalWebhookService } from './external-webhook.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'

const CreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
})
const UpdateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
})

@Controller({ path: 'webhook-subscriptions', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
@RequireRole('owner', 'admin')
export class ExternalWebhookController {
  constructor(private readonly webhooks: ExternalWebhookService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.webhooks.list(user.companyId!)
  }

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = CreateSchema.parse(body)
    return this.webhooks.create({
      companyId: user.companyId!,
      userId: user.sub,
      url: dto.url,
      events: dto.events,
    })
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = UpdateSchema.parse(body)
    return this.webhooks.update({
      companyId: user.companyId!,
      id,
      userId: user.sub,
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.events !== undefined ? { events: dto.events } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    })
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.webhooks.remove(user.companyId!, id, user.sub)
  }

  @Post(':id/rotate-secret')
  rotateSecret(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.webhooks.rotateSecret(user.companyId!, id, user.sub)
  }

  @Get(':id/deliveries')
  deliveries(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.webhooks.deliveries(user.companyId!, id)
  }
}
