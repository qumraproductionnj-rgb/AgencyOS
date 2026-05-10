import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { EmployeeService } from './employee.service'
import {
  AcceptInviteSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  type AcceptInviteDto,
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
} from './employee.dto'

@ApiTags('employees')
@ApiBearerAuth()
@Controller({ path: 'employees', version: '1' })
@RequireTier('TENANT')
export class EmployeeController {
  constructor(private readonly emp: EmployeeService) {}

  @Get()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'List employees with optional filters' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const filters: Record<string, string> = {}
    if (departmentId !== undefined) filters['departmentId'] = departmentId
    if (status !== undefined) filters['status'] = status
    if (search !== undefined) filters['search'] = search
    return this.emp.findAll(user.companyId!, filters)
  }

  @Get(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.emp.findOne(user.companyId!, id)
  }

  @Post()
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Create an employee and send invitation email' })
  async create(
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) dto: CreateEmployeeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.emp.create(user.companyId!, dto, user.sub)
  }

  @Put(':id')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Update an employee' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) dto: UpdateEmployeeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.emp.update(user.companyId!, id, dto, user.sub)
  }

  @Delete(':id')
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Soft delete an employee' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.emp.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}

@ApiTags('employees')
@Public()
@Controller({ path: 'employees', version: '1' })
export class EmployeePublicController {
  constructor(private readonly emp: EmployeeService) {}

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation and set password' })
  async acceptInvite(@Body(new ZodValidationPipe(AcceptInviteSchema)) dto: AcceptInviteDto) {
    await this.emp.acceptInvite(dto.token, dto.password)
    return { status: 'accepted' }
  }
}
