import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
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

const OrgStructureSchema = z.object({
  type: z.enum(['FLAT', 'HIERARCHICAL', 'HYBRID']),
})
type OrgStructureDto = z.infer<typeof OrgStructureSchema>

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

  @Get('tree')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Get departments as a tree' })
  async findTree(@CurrentUser() user: CurrentUserPayload) {
    return this.dept.findTree(user.companyId!)
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

  @Get('org-structure/current')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: 'Get current org structure type' })
  async getOrgStructure(@CurrentUser() user: CurrentUserPayload) {
    return this.dept.getOrgStructure(user.companyId!)
  }

  @Patch('org-structure/current')
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'Set org structure type (FLAT/HIERARCHICAL/HYBRID)' })
  async setOrgStructure(
    @Body(new ZodValidationPipe(OrgStructureSchema)) dto: OrgStructureDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dept.setOrgStructure(user.companyId!, dto.type, user.sub)
  }
}
