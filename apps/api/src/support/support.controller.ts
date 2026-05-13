import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { SupportService } from './support.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'

const CreateTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(10000),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  category: z.string().optional(),
})
const ReplySchema = z.object({ body: z.string().min(1).max(10000) })
const StatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']),
})

@Controller({ path: 'support', version: '1' })
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('articles')
  @Public()
  listArticles(@Query('category') category?: string) {
    return this.support.listArticles(category)
  }

  @Get('articles/:slug')
  @Public()
  getArticle(@Param('slug') slug: string) {
    return this.support.getArticle(slug)
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  listTickets(@CurrentUser() user: CurrentUserPayload, @Query('status') status?: string) {
    return this.support.listTickets(user.companyId!, status)
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  createTicket(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = CreateTicketSchema.parse(body)
    return this.support.createTicket({
      companyId: user.companyId!,
      userId: user.sub,
      subject: dto.subject,
      body: dto.body,
      ...(dto.priority ? { priority: dto.priority } : {}),
      ...(dto.category ? { category: dto.category } : {}),
    })
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  getTicket(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.support.getTicket(user.companyId!, id)
  }

  @Post('tickets/:id/reply')
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  reply(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = ReplySchema.parse(body)
    return this.support.replyTicket({
      companyId: user.companyId!,
      userId: user.sub,
      ticketId: id,
      body: dto.body,
      isFromStaff: false,
    })
  }

  @Patch('tickets/:id/status')
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  setStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = StatusSchema.parse(body)
    return this.support.updateTicketStatus({
      companyId: user.companyId!,
      ticketId: id,
      status: dto.status,
    })
  }
}
