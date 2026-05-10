import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PdfService } from '../quotations/pdf.service'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'

@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PdfService],
  exports: [InvoiceService],
})
export class InvoicesModule {}
