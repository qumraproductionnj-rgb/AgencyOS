import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  GeneratePayrollSchema,
  UpdateEntrySchema,
  type GeneratePayrollDto,
  type UpdateEntryDto,
} from './payroll.dto'
import { PayrollService } from './payroll.service'

@ApiTags('payroll')
@ApiBearerAuth()
@Controller({ path: 'payroll', version: '1' })
@RequireTier('TENANT')
@RequireRole('owner', 'admin', 'hr_manager')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'List payroll runs' })
  async findAll(@Query('year') year: string | undefined, @CurrentUser() user: CurrentUserPayload) {
    return this.payroll.findAll(user.companyId!, year ? { year: Number(year) } : undefined)
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a payroll run for a given month/year' })
  async generate(
    @Body(new ZodValidationPipe(GeneratePayrollSchema)) dto: GeneratePayrollDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.payroll.generate(user.companyId!, user.sub, dto.month, dto.year)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll run with entries' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payroll.findOne(user.companyId!, id)
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalize a draft payroll run' })
  async finalize(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payroll.finalize(user.companyId!, id, user.sub)
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark a finalized payroll run as paid' })
  async markPaid(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payroll.markPaid(user.companyId!, id, user.sub)
  }

  @Patch('entries/:entryId')
  @ApiOperation({ summary: 'Update a payroll entry (additions/deductions)' })
  async updateEntry(
    @Param('entryId') entryId: string,
    @Body(new ZodValidationPipe(UpdateEntrySchema)) dto: UpdateEntryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.payroll.updateEntry(user.companyId!, entryId, user.sub, {
      ...(dto.additions !== undefined ? { additions: dto.additions } : {}),
      ...(dto.deductions !== undefined ? { deductions: dto.deductions } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    })
  }
}
