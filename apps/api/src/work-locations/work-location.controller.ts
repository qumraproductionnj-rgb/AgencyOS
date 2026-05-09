import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { WorkLocationService } from './work-location.service'
import {
  AssignEmployeesSchema,
  CreateWorkLocationSchema,
  UpdateWorkLocationSchema,
  type AssignEmployeesDto,
  type CreateWorkLocationDto,
  type UpdateWorkLocationDto,
} from './work-location.dto'

@ApiTags('work-locations')
@ApiBearerAuth()
@Controller({ path: 'work-locations', version: '1' })
@RequireTier('TENANT')
export class WorkLocationController {
  constructor(private readonly svc: WorkLocationService) {}

  @Get()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'List all work locations' })
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.findAll(user.companyId!)
  }

  @Get(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Get work location by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findOne(user.companyId!, id)
  }

  @Post()
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Create a work location' })
  async create(
    @Body(new ZodValidationPipe(CreateWorkLocationSchema)) dto: CreateWorkLocationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.create(user.companyId!, dto, user.sub)
  }

  @Put(':id')
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Update a work location' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateWorkLocationSchema)) dto: UpdateWorkLocationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.update(user.companyId!, id, dto, user.sub)
  }

  @Delete(':id')
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Soft delete a work location' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.svc.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  @Post(':id/employees')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Assign employees to a work location' })
  async assignEmployees(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignEmployeesSchema)) dto: AssignEmployeesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.assignEmployees(user.companyId!, id, dto.employeeIds)
  }

  @Delete(':id/employees/:employeeId')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Unassign an employee from a work location' })
  async unassignEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.unassignEmployee(user.companyId!, id, employeeId)
  }
}
