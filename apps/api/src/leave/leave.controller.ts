import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { PermissionService } from '../permissions/permission.service'
import { LeaveService } from './leave.service'
import {
  ApproveLeaveSchema,
  CreateLeaveSchema,
  RejectLeaveSchema,
  type ApproveLeaveDto,
  type CreateLeaveDto,
  type RejectLeaveDto,
} from './leave.dto'

@ApiTags('leaves')
@ApiBearerAuth()
@Controller({ path: 'leaves', version: '1' })
@RequireTier('TENANT')
export class LeaveController {
  constructor(
    private readonly leave: LeaveService,
    private readonly permission: PermissionService,
  ) {}

  @Post()
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'Create a leave request' })
  async create(
    @Body(new ZodValidationPipe(CreateLeaveSchema)) dto: CreateLeaveDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.leave.create(user.companyId!, user.sub, dto)
  }

  @Get()
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'List leaves with optional filters' })
  async findAll(@Query() query: Record<string, string>, @CurrentUser() user: CurrentUserPayload) {
    return this.leave.findAll(user.companyId!, user.sub, query)
  }

  @Get('balance')
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'Get current year leave balances' })
  async getBalances(@CurrentUser() user: CurrentUserPayload) {
    return this.leave.getBalances(user.companyId!, user.sub)
  }

  @Get(':id')
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'Get leave by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.leave.findOne(user.companyId!, id)
  }

  @Patch(':id/approve')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Approve a pending leave' })
  async approve(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApproveLeaveSchema)) _dto: ApproveLeaveDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const roles = await this.permission.getUserRoles(user.sub, user.companyId!)
    return this.leave.approve(user.companyId!, id, user.sub, roles)
  }

  @Patch(':id/reject')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Reject a pending leave' })
  async reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RejectLeaveSchema)) dto: RejectLeaveDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.leave.reject(user.companyId!, id, user.sub, dto)
  }

  @Patch(':id/cancel')
  @RequireRole('owner', 'admin', 'hr_manager', 'employee')
  @ApiOperation({ summary: 'Cancel a pending or approved leave' })
  async cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.leave.cancel(user.companyId!, id, user.sub)
  }
}
