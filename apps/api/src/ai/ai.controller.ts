import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { GenerateSchema, type GenerateDto } from './ai.dto'
import { AiGenerationService } from './ai-generation.service'

@ApiTags('ai')
@Controller()
@RequireRole('owner', 'admin', 'creative_director', 'account_manager', 'designer', 'video_editor')
export class AiController {
  constructor(private readonly ai: AiGenerationService) {}

  @Post('v1/ai/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate content using AI' })
  @RequireTier('TENANT')
  async generate(
    @Body(new ZodValidationPipe(GenerateSchema)) dto: GenerateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ai.generate(user.companyId!, user.sub, dto)
  }

  @Get('v1/ai/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List AI generation history' })
  @RequireTier('TENANT')
  async getHistory(
    @Query('limit') limit: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const n = limit ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100) : 20
    return this.ai.getHistory(user.companyId!, n, cursor)
  }

  @Patch('v1/ai/generations/:id/mark-used')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark an AI generation as used with optional rating' })
  @RequireTier('TENANT')
  async markUsed(
    @Param('id') id: string,
    @Body() body: { rating?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ai.markUsed(user.companyId!, id, body.rating)
  }
}
