import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  UpdateLeadStatusSchema,
  type CreateLeadDto,
  type UpdateLeadDto,
  type UpdateLeadStatusDto,
} from './lead.dto'
import { LeadService } from './lead.service'

@ApiTags('leads')
@ApiBearerAuth()
@Controller({ path: 'leads', version: '1' })
@RequireTier('TENANT')
@RequireRole('owner', 'admin', 'sales', 'account_manager')
export class LeadController {
  constructor(private readonly lead: LeadService) {}

  @Get()
  @ApiOperation({ summary: 'List leads with optional filters' })
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lead.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
    })
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead' })
  async create(
    @Body(new ZodValidationPipe(CreateLeadSchema)) dto: CreateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lead.create(user.companyId!, user.sub, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.lead.findOne(user.companyId!, id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lead' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateLeadSchema)) dto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lead.update(user.companyId!, id, user.sub, dto)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition lead stage (WON creates client + deal)' })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateLeadStatusSchema)) dto: UpdateLeadStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lead.updateStatus(user.companyId!, id, user.sub, dto.status)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.lead.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
