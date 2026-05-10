import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateCommentSchema,
  CreateTaskSchema,
  StartTimerSchema,
  StopTimerSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
  type CreateCommentDto,
  type CreateTaskDto,
  type StartTimerDto,
  type StopTimerDto,
  type UpdateTaskDto,
  type UpdateTaskStatusDto,
} from './task.dto'
import { TaskService } from './task.service'

@ApiTags('tasks')
@Controller()
@RequireRole('owner', 'admin', 'project_manager', 'creative_director', 'account_manager')
export class TaskController {
  constructor(private readonly task: TaskService) {}

  @Get('v1/tasks')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tasks (top-level only)' })
  @RequireTier('TENANT')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('priority') priority: string | undefined,
    @Query('projectId') projectId: string | undefined,
    @Query('assignedTo') assignedTo: string | undefined,
    @Query('dueBefore') dueBefore: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(projectId !== undefined ? { projectId } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(dueBefore !== undefined ? { dueBefore } : {}),
    })
  }

  @Get('v1/tasks/workload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get workload overview per user' })
  @RequireTier('TENANT')
  async getWorkload(@CurrentUser() user: CurrentUserPayload) {
    return this.task.getWorkload(user.companyId!)
  }

  @Post('v1/tasks')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a task' })
  @RequireTier('TENANT')
  async create(
    @Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/tasks/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a task by ID' })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.task.findOne(user.companyId!, id)
  }

  @Put('v1/tasks/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a task' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/tasks/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update task status (forward-only transitions)' })
  @RequireTier('TENANT')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskStatusSchema)) dto: UpdateTaskStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.updateStatus(user.companyId!, id, user.sub, dto.status)
  }

  @Post('v1/tasks/:id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a task' })
  @RequireTier('TENANT')
  async addComment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateCommentSchema)) dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.addComment(user.companyId!, id, user.sub, dto.content, dto.mentions)
  }

  @Delete('v1/tasks/:id/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (own only)' })
  @RequireTier('TENANT')
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.task.deleteComment(user.companyId!, id, commentId, user.sub)
    return { status: 'deleted' }
  }

  @Post('v1/tasks/:id/timer/start')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a timer on a task' })
  @RequireTier('TENANT')
  async startTimer(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(StartTimerSchema)) dto: StartTimerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.startTimer(user.companyId!, id, user.sub, dto.notes)
  }

  @Post('v1/tasks/:id/timer/stop')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stop the active timer on a task' })
  @RequireTier('TENANT')
  async stopTimer(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(StopTimerSchema)) dto: StopTimerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.task.stopTimer(user.companyId!, id, user.sub, dto.notes)
  }

  @Delete('v1/tasks/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a task (soft delete)' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.task.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
