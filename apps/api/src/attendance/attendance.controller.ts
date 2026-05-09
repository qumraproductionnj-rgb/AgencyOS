import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { AttendanceService } from './attendance.service'
import { CheckInSchema, CheckOutSchema, type CheckInDto, type CheckOutDto } from './attendance.dto'

@ApiTags('attendance')
@ApiBearerAuth()
@Controller({ path: 'attendance', version: '1' })
@RequireTier('TENANT')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in with GPS coordinates' })
  async checkIn(
    @Body(new ZodValidationPipe(CheckInSchema)) dto: CheckInDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.checkIn(user.companyId!, user.sub, dto)
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out' })
  async checkOut(
    @Body(new ZodValidationPipe(CheckOutSchema)) dto: CheckOutDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.checkOut(user.companyId!, user.sub, dto)
  }

  @Get('today')
  @ApiOperation({ summary: "Get current user's attendance today" })
  async getToday(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.getToday(user.companyId!, user.sub)
  }

  @Get('today/all')
  @RequireRole('owner', 'admin', 'hr_manager')
  @ApiOperation({ summary: "Get all employees today's attendance (HR view)" })
  @ApiQuery({ name: 'departmentId', required: false })
  async getTodayAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.svc.getTodayAll(user.companyId!, departmentId)
  }
}
