import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateProjectRevisionSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  UpdateProjectStageSchema,
  type CreateProjectDto,
  type CreateProjectRevisionDto,
  type UpdateProjectDto,
  type UpdateProjectStageDto,
} from './project.dto'
import { ProjectService } from './project.service'

@ApiTags('projects')
@Controller()
@RequireRole('owner', 'admin', 'project_manager', 'creative_director')
export class ProjectController {
  constructor(private readonly project: ProjectService) {}

  @Get('v1/projects')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List projects' })
  @RequireTier('TENANT')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('stage') stage: string | undefined,
    @Query('clientId') clientId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.project.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(stage !== undefined ? { stage } : {}),
      ...(clientId !== undefined ? { clientId } : {}),
    })
  }

  @Post('v1/projects')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project' })
  @RequireTier('TENANT')
  async create(
    @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.project.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/projects/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a project by ID' })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.project.findOne(user.companyId!, id)
  }

  @Put('v1/projects/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) dto: UpdateProjectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.project.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/projects/:id/stage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project stage (forward-only)' })
  @RequireTier('TENANT')
  async updateStage(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectStageSchema)) dto: UpdateProjectStageDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.project.updateStage(user.companyId!, id, user.sub, dto.stage)
  }

  @Post('v1/projects/:id/revisions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a revision request (max 3)' })
  @RequireTier('TENANT')
  async addRevision(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateProjectRevisionSchema)) dto: CreateProjectRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.project.addRevision(user.companyId!, id, user.sub, dto.notes)
  }

  @Delete('v1/projects/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (soft delete)' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.project.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
