import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreatePerformanceReviewSchema,
  UpdatePerformanceReviewSchema,
  type CreatePerformanceReviewDto,
  type UpdatePerformanceReviewDto,
} from './performance-review.dto'
import { PerformanceReviewService } from './performance-review.service'

@ApiTags('performance-reviews')
@ApiBearerAuth()
@Controller({ path: 'performance-reviews', version: '1' })
@RequireTier('TENANT')
export class PerformanceReviewController {
  constructor(private readonly svc: PerformanceReviewService) {}

  @Get()
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'List performance reviews' })
  async findAll(
    @Query('employeeId') employeeId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.findAll(user.companyId!, user.sub, employeeId)
  }

  @Post()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Create a performance review' })
  async create(
    @Body(new ZodValidationPipe(CreatePerformanceReviewSchema)) dto: CreatePerformanceReviewDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.create(user.companyId!, user.sub, dto)
  }

  @Get(':id')
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'Get a performance review by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findOne(user.companyId!, id)
  }

  @Put(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Update a performance review' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePerformanceReviewSchema)) dto: UpdatePerformanceReviewDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.update(user.companyId!, id, user.sub, dto)
  }

  @Delete(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Delete a performance review' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.svc.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
