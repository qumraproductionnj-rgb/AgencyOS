import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateQuotationSchema,
  UpdateQuotationSchema,
  UpdateQuotationStatusSchema,
  type CreateQuotationDto,
  type UpdateQuotationDto,
  type UpdateQuotationStatusDto,
} from './quotation.dto'
import { QuotationService } from './quotation.service'

@ApiTags('quotations')
@Controller()
export class QuotationController {
  constructor(private readonly quotation: QuotationService) {}

  // --- Authenticated endpoints (tenant) ---

  @Get('v1/quotations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List quotations' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quotation.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
    })
  }

  @Post('v1/quotations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a quotation' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async create(
    @Body(new ZodValidationPipe(CreateQuotationSchema)) dto: CreateQuotationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quotation.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/quotations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a quotation by ID' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotation.findOne(user.companyId!, id)
  }

  @Put('v1/quotations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quotation (draft only)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateQuotationSchema)) dto: UpdateQuotationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quotation.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/quotations/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update quotation status' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateQuotationStatusSchema)) dto: UpdateQuotationStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quotation.updateStatus(
      user.companyId!,
      id,
      user.sub,
      dto.status,
      dto.rejectionReason,
    )
  }

  @Get('v1/quotations/:id/pdf')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download quotation PDF' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const pdf = await this.quotation.generatePdf(user.companyId!, id)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quotation-${id}.pdf"`,
      'Content-Length': pdf.length,
    })
    res.end(pdf)
  }

  @Delete('v1/quotations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quotation' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'sales', 'account_manager')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.quotation.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  // --- Public endpoints (no auth) ---

  @Get('public/quotations/:token')
  @Public()
  @ApiOperation({ summary: 'View quotation by public token' })
  async findByToken(@Param('token') token: string) {
    return this.quotation.findByToken(token)
  }

  @Post('public/quotations/:token/accept')
  @Public()
  @ApiOperation({ summary: 'Accept quotation via public token' })
  async acceptByToken(@Param('token') token: string) {
    return this.quotation.acceptByToken(token)
  }
}
