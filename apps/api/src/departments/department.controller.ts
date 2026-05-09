import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { DepartmentService } from './department.service'
import {
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  type CreateDepartmentDto,
  type UpdateDepartmentDto,
} from './department.dto'

@ApiTags('departments')
@ApiBearerAuth()
@Controller({ path: 'departments', version: '1' })
@RequireTier('TENANT')
export class DepartmentController {
  constructor(private readonly dept: DepartmentService) {}

  @Get()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'List all departments' })
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.dept.findAll(user.companyId!)
  }

  @Get(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Get department by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.dept.findOne(user.companyId!, id)
  }

  @Post()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Create a department' })
  async create(
    @Body(new ZodValidationPipe(CreateDepartmentSchema)) dto: CreateDepartmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dept.create(user.companyId!, dto, user.sub)
  }

  @Put(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Update a department' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateDepartmentSchema)) dto: UpdateDepartmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dept.update(user.companyId!, id, dto, user.sub)
  }

  @Delete(':id')
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Soft delete a department' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.dept.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
