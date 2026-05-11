import type { ZodSchema } from 'zod'
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateContentPlanSchema,
  UpdateContentPlanSchema,
  UpdateStatusSchema,
  GenerateIdeasSchema,
  FinalizePlanSchema,
  ContentPlanQuerySchema,
  type CreateContentPlanDto,
  type UpdateContentPlanDto,
  type UpdateStatusDto,
  type GenerateIdeasDto,
  type FinalizePlanDto,
  type ContentPlanQueryDto,
} from './content-plan.dto'
import { ContentPlanService } from './content-plan.service'

@ApiTags('content-plans')
@Controller()
@RequireRole('owner', 'admin', 'creative_director', 'account_manager')
export class ContentPlanController {
  constructor(private readonly plan: ContentPlanService) {}

  @Get('v1/content-plans')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content plans with filters' })
  @RequireTier('TENANT')
  async findAll(
    @Query(
      new ZodValidationPipe(ContentPlanQuerySchema as unknown as ZodSchema<ContentPlanQueryDto>),
    )
    query: ContentPlanQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.findAll(user.companyId!, query)
  }

  @Get('v1/content-plans/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a content plan with pieces' })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.plan.findOne(user.companyId!, id)
  }

  @Post('v1/content-plans')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a content plan (one per client per month)' })
  @RequireTier('TENANT')
  async create(
    @Body(new ZodValidationPipe(CreateContentPlanSchema)) dto: CreateContentPlanDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.create(user.companyId!, user.sub, dto)
  }

  @Put('v1/content-plans/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a content plan' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContentPlanSchema)) dto: UpdateContentPlanDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/content-plans/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update content plan status (state machine)' })
  @RequireTier('TENANT')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.updateStatus(user.companyId!, id, user.sub, dto)
  }

  @Delete('v1/content-plans/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a content plan (soft delete)' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.plan.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  @Post('v1/content-plans/:id/generate-ideas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI content ideas for the plan' })
  @RequireTier('TENANT')
  async generateIdeas(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GenerateIdeasSchema)) dto: GenerateIdeasDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.generateIdeas(user.companyId!, id, dto)
  }

  @Post('v1/content-plans/:id/finalize')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalize plan — create ContentPiece records' })
  @RequireTier('TENANT')
  async finalize(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(FinalizePlanSchema)) dto: FinalizePlanDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.plan.finalize(user.companyId!, id, user.sub, dto)
  }
}
