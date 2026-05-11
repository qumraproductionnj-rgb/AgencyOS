import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateContentPillarSchema,
  UpdateContentPillarSchema,
  ContentPillarQuerySchema,
  type CreateContentPillarDto,
  type UpdateContentPillarDto,
  type ContentPillarQueryDto,
} from './content-pillar.dto'
import { ContentPillarService } from './content-pillar.service'

@ApiTags('content-pillars')
@Controller()
export class ContentPillarController {
  constructor(private readonly pillar: ContentPillarService) {}

  @Get('v1/content-pillars')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content pillars, optionally filtered by clientId' })
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
    @Query(new ZodValidationPipe(ContentPillarQuerySchema)) query: ContentPillarQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.pillar.findAll(user.companyId!, query)
  }

  @Get('v1/content-pillars/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a content pillar by ID' })
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
    return this.pillar.findOne(user.companyId!, id)
  }

  @Post('v1/content-pillars')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a content pillar' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async create(
    @Body(new ZodValidationPipe(CreateContentPillarSchema)) dto: CreateContentPillarDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.pillar.create(user.companyId!, user.sub, dto)
  }

  @Put('v1/content-pillars/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a content pillar' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContentPillarSchema)) dto: UpdateContentPillarDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.pillar.update(user.companyId!, id, user.sub, dto)
  }

  @Delete('v1/content-pillars/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a content pillar (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.pillar.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
