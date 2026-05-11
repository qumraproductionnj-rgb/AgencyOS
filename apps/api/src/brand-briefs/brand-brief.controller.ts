import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateBrandBriefSchema,
  UpdateBrandBriefSchema,
  BrandBriefQuerySchema,
  CreatePersonaSchema,
  UpdatePersonaSchema,
  type CreateBrandBriefDto,
  type UpdateBrandBriefDto,
  type BrandBriefQueryDto,
  type CreatePersonaDto,
  type UpdatePersonaDto,
} from './brand-brief.dto'
import { BrandBriefService } from './brand-brief.service'

@ApiTags('brand-briefs')
@Controller()
export class BrandBriefController {
  constructor(private readonly brief: BrandBriefService) {}

  // ─── Brand Briefs ────────────────────────────────────

  @Get('v1/brand-briefs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List brand briefs' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'account_manager',
    'designer',
    'video_editor',
    'project_manager',
  )
  async findAll(
    @Query(new ZodValidationPipe(BrandBriefQuerySchema)) query: BrandBriefQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.brief.findAll(user.companyId!, query)
  }

  @Get('v1/brand-briefs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a brand brief by ID with personas' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'account_manager',
    'designer',
    'video_editor',
    'project_manager',
  )
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.brief.findOne(user.companyId!, id)
  }

  @Post('v1/brand-briefs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a brand brief (one per client)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async create(
    @Body(new ZodValidationPipe(CreateBrandBriefSchema)) dto: CreateBrandBriefDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.brief.create(user.companyId!, user.sub, dto)
  }

  @Put('v1/brand-briefs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a brand brief' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateBrandBriefSchema)) dto: UpdateBrandBriefDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.brief.update(user.companyId!, id, user.sub, dto)
  }

  @Delete('v1/brand-briefs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a brand brief (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.brief.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  // ─── Audience Personas ───────────────────────────────

  @Get('v1/brand-briefs/:briefId/personas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List personas for a brand brief' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'account_manager',
    'designer',
    'video_editor',
    'project_manager',
  )
  async findPersonas(@Param('briefId') briefId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.brief.findPersonas(user.companyId!, briefId)
  }

  @Post('v1/brand-briefs/:briefId/personas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a persona to a brand brief' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async createPersona(
    @Param('briefId') briefId: string,
    @Body(new ZodValidationPipe(CreatePersonaSchema)) dto: CreatePersonaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.brief.createPersona(user.companyId!, briefId, user.sub, dto)
  }

  @Put('v1/brand-briefs/:briefId/personas/:personaId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a persona' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async updatePersona(
    @Param('briefId') briefId: string,
    @Param('personaId') personaId: string,
    @Body(new ZodValidationPipe(UpdatePersonaSchema)) dto: UpdatePersonaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.brief.updatePersona(user.companyId!, briefId, personaId, user.sub, dto)
  }

  @Delete('v1/brand-briefs/:briefId/personas/:personaId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a persona (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async removePersona(
    @Param('briefId') briefId: string,
    @Param('personaId') personaId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.brief.removePersona(user.companyId!, briefId, personaId)
    return { status: 'deleted' }
  }
}
