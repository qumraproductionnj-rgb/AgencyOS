import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  UpdateCampaignStatusSchema,
  type CreateCampaignDto,
  type UpdateCampaignDto,
  type UpdateCampaignStatusDto,
} from './campaign.dto'
import { CampaignService } from './campaign.service'

@ApiTags('campaigns')
@Controller()
@RequireRole('owner', 'admin', 'account_manager', 'sales')
export class CampaignController {
  constructor(private readonly campaign: CampaignService) {}

  @Get('v1/campaigns')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns' })
  @RequireTier('TENANT')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('clientId') clientId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaign.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(clientId !== undefined ? { clientId } : {}),
    })
  }

  @Post('v1/campaigns')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a campaign' })
  @RequireTier('TENANT')
  async create(
    @Body(new ZodValidationPipe(CreateCampaignSchema)) dto: CreateCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaign.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/campaigns/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.campaign.findOne(user.companyId!, id)
  }

  @Put('v1/campaigns/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a campaign' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCampaignSchema)) dto: UpdateCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaign.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/campaigns/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign status (forward-only)' })
  @RequireTier('TENANT')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCampaignStatusSchema)) dto: UpdateCampaignStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaign.updateStatus(user.companyId!, id, user.sub, dto.status)
  }

  @Delete('v1/campaigns/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a campaign (soft delete)' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.campaign.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
