import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  ApproveExpenseSchema,
  CreateExpenseSchema,
  UpdateExpenseSchema,
  type ApproveExpenseDto,
  type CreateExpenseDto,
  type UpdateExpenseDto,
} from './expense.dto'
import { ExpenseService } from './expense.service'

@ApiTags('expenses')
@Controller()
export class ExpenseController {
  constructor(private readonly expense: ExpenseService) {}

  @Get('v1/expenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List expenses' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager', 'account_manager')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('category') category: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.expense.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(category !== undefined ? { category } : {}),
    })
  }

  @Post('v1/expenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an expense' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager', 'account_manager')
  async create(
    @Body(new ZodValidationPipe(CreateExpenseSchema)) dto: CreateExpenseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.expense.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/expenses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an expense by ID' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager', 'account_manager')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.expense.findOne(user.companyId!, id)
  }

  @Put('v1/expenses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an expense (pending only)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager', 'account_manager')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateExpenseSchema)) dto: UpdateExpenseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.expense.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/expenses/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject an expense' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager')
  async approve(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApproveExpenseSchema)) dto: ApproveExpenseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.expense.approve(user.companyId!, id, user.sub, dto.status, dto.rejectionReason)
  }

  @Delete('v1/expenses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an expense (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'project_manager')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.expense.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
