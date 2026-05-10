import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateInvoiceSchema,
  RecordPaymentSchema,
  UpdateInvoiceSchema,
  UpdateInvoiceStatusSchema,
  type CreateInvoiceDto,
  type RecordPaymentDto,
  type UpdateInvoiceDto,
  type UpdateInvoiceStatusDto,
} from './invoice.dto'
import { InvoiceService } from './invoice.service'

@ApiTags('invoices')
@Controller()
export class InvoiceController {
  constructor(private readonly invoice: InvoiceService) {}

  @Get('v1/invoices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invoices' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager', 'sales')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoice.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
    })
  }

  @Post('v1/invoices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an invoice' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async create(
    @Body(new ZodValidationPipe(CreateInvoiceSchema)) dto: CreateInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoice.create(user.companyId!, user.sub, dto)
  }

  @Get('v1/invoices/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an invoice by ID' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager', 'sales')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoice.findOne(user.companyId!, id)
  }

  @Put('v1/invoices/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an invoice (draft only)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateInvoiceSchema)) dto: UpdateInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoice.update(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/invoices/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update invoice status' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateInvoiceStatusSchema)) dto: UpdateInvoiceStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoice.updateStatus(user.companyId!, id, user.sub, dto.status)
  }

  @Patch('v1/invoices/:id/send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send an invoice (DRAFT → SENT, generates PDF)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async send(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoice.send(user.companyId!, id, user.sub)
  }

  @Post('v1/invoices/:id/payments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a payment on an invoice' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async recordPayment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RecordPaymentSchema)) dto: RecordPaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoice.recordPayment(user.companyId!, id, user.sub, dto)
  }

  @Get('v1/invoices/:id/pdf')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download invoice PDF' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager', 'sales')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const pdf = await this.invoice.generatePdf(user.companyId!, id)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': pdf.length,
    })
    res.end(pdf)
  }

  @Delete('v1/invoices/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an invoice (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'account_manager')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.invoice.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
