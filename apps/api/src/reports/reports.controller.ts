import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'

@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
@RequireRole('owner', 'admin')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('financial')
  financial(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.financial(parseRange(from, to))
  }

  @Get('operations')
  operations(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.operations(parseRange(from, to))
  }

  @Get('hr')
  hr(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.hr(parseRange(from, to))
  }

  @Get('sales')
  sales(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.sales(parseRange(from, to))
  }
}

function parseRange(from?: string, to?: string): { from: Date; to: Date } {
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : now,
  }
}
