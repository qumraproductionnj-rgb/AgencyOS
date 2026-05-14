import { Controller, Post, Get, Body, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { BetaService } from './beta.service'
import {
  CreateBetaInviteSchema,
  AcceptBetaInviteSchema,
  type CreateBetaInviteDto,
  type AcceptBetaInviteDto,
} from './beta.dto'

@Controller('beta')
export class BetaController {
  constructor(private readonly betaService: BetaService) {}

  @Post('invite')
  @UsePipes(new ZodValidationPipe(CreateBetaInviteSchema))
  createInvite(@Body() dto: CreateBetaInviteDto) {
    return this.betaService.createInvite(dto)
  }

  @Post('accept')
  @UsePipes(new ZodValidationPipe(AcceptBetaInviteSchema))
  acceptInvite(@Body() dto: AcceptBetaInviteDto) {
    return this.betaService.acceptInvite(dto.token, dto.ownerName, dto.password)
  }

  @Get('invites')
  listInvites() {
    return this.betaService.listInvites()
  }
}
