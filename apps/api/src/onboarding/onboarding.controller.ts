import { Body, Controller, Get, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { OnboardingService } from './onboarding.service'
import { SaveProgressSchema, type SaveProgressDto } from './dto/onboarding.dto'

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller({ path: 'onboarding', version: '1' })
@RequireTier('TENANT')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get current onboarding progress' })
  async getProgress(@CurrentUser() user: CurrentUserPayload) {
    return this.onboarding.getProgress(user.companyId!)
  }

  @Put('progress')
  @ApiOperation({ summary: 'Save onboarding progress for current step' })
  async saveProgress(
    @Body(new ZodValidationPipe(SaveProgressSchema)) dto: SaveProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.onboarding.saveProgress(
      user.companyId!,
      dto.currentStep,
      dto.data as unknown as Record<string, unknown>,
      user.sub,
    )
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding wizard' })
  async complete(@CurrentUser() user: CurrentUserPayload) {
    await this.onboarding.complete(user.companyId!, user.sub)
    return { status: 'completed' }
  }

  @Post('skip')
  @ApiOperation({ summary: 'Skip onboarding wizard' })
  async skip(@CurrentUser() user: CurrentUserPayload) {
    await this.onboarding.skip(user.companyId!, user.sub)
    return { status: 'skipped' }
  }
}
