import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  UpdateContentPieceSchema,
  UpdateStageSchema,
  CreateRevisionSchema,
  UpdateRevisionSchema,
  type UpdateContentPieceDto,
  type UpdateStageDto,
  type CreateRevisionDto,
  type UpdateRevisionDto,
} from './content-piece.dto'
import { ContentPieceService } from './content-piece.service'

@ApiTags('content-pieces')
@Controller()
@RequireRole('owner', 'admin', 'creative_director', 'account_manager', 'designer', 'video_editor')
export class ContentPieceController {
  constructor(private readonly svc: ContentPieceService) {}

  // ─── Piece endpoints ───────────────────────────────

  @Get('v1/content-pieces/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a content piece by ID (with plan, client, pillar, project, revisions)',
  })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findOne(user.companyId!, id)
  }

  @Put('v1/content-pieces/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a content piece (caption, hashtags, components, etc.)' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContentPieceSchema)) dto: UpdateContentPieceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/content-pieces/:id/stage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transition a content piece stage (state machine)' })
  @RequireTier('TENANT')
  async updateStage(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStageSchema)) dto: UpdateStageDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.updateStage(user.companyId!, id, user.sub, dto)
  }

  // ─── Revision endpoints ────────────────────────────

  @Get('v1/content-pieces/:id/revisions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List revisions for a content piece' })
  @RequireTier('TENANT')
  async findRevisions(@Param('id') pieceId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findRevisions(user.companyId!, pieceId)
  }

  @Post('v1/content-pieces/:id/revisions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a revision request for a content piece' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'account_manager')
  async createRevision(
    @Param('id') pieceId: string,
    @Body(new ZodValidationPipe(CreateRevisionSchema)) dto: CreateRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.createRevision(user.companyId!, pieceId, user.sub, dto)
  }

  @Put('v1/content-pieces/:id/revisions/:revisionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a revision (status, feedback)' })
  @RequireTier('TENANT')
  async updateRevision(
    @Param('id') pieceId: string,
    @Param('revisionId') revisionId: string,
    @Body(new ZodValidationPipe(UpdateRevisionSchema)) dto: UpdateRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.updateRevision(user.companyId!, pieceId, revisionId, user.sub, dto)
  }
}
