import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PdfService } from './pdf.service'
import { QuotationController } from './quotation.controller'
import { QuotationService } from './quotation.service'

@Module({
  imports: [DatabaseModule],
  controllers: [QuotationController],
  providers: [QuotationService, PdfService],
  exports: [QuotationService],
})
export class QuotationsModule {}
