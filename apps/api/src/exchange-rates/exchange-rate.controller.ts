import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  SetRateSchema,
  UpdateRateSchema,
  type SetRateDto,
  type UpdateRateDto,
} from './exchange-rate.dto'
import { ExchangeRateService } from './exchange-rate.service'

@ApiTags('exchange-rates')
@Controller()
export class ExchangeRateController {
  constructor(private readonly exchangeRate: ExchangeRateService) {}

  @Get('v1/exchange-rates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List exchange rates' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async findAll(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.exchangeRate.findAll(user.companyId!, from, to)
  }

  @Get('v1/exchange-rates/current')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current rate for a pair' })
  @RequireTier('TENANT')
  async findCurrent(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const f = from ?? 'USD'
    const t = to ?? 'IQD'
    const rate = await this.exchangeRate.findCurrent(user.companyId!, f, t)
    return rate ?? { fromCurrency: f, toCurrency: t, rate: null }
  }

  @Post('v1/exchange-rates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a manual exchange rate' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin')
  async setManual(
    @Body(new ZodValidationPipe(SetRateSchema)) dto: SetRateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.exchangeRate.setManual(user.companyId!, user.sub, dto)
  }

  @Patch('v1/exchange-rates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a manual rate' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateRateSchema)) dto: UpdateRateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.exchangeRate.update(user.companyId!, id, user.sub, dto)
  }

  @Delete('v1/exchange-rates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an exchange rate' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.exchangeRate.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
