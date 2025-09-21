import { forwardRef, Module } from '@nestjs/common';
import { VendorInvoiceService } from './vendor-invoice.service';
import {
  GeneralVendorInvoiceController,
  VendorInvoiceController,
} from './vendor-invoice.controller';
import { LlmModule } from '@app/common/llm/llm.module';
import { UploadInvoiceResponseDto } from './dto/upload-invoice.dto';
import { SYSTEM_PROMPT_TEMPLATE_OCR } from '@app/common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorInvoice } from '@app/common/database/entities';
import { VendorsModule } from '../vendors.module';

@Module({
  imports: [
    forwardRef(() => VendorsModule),
    LlmModule.register({
      enableStructuredOutput: true,
      structuredOutputSchema: UploadInvoiceResponseDto,
      systemTemplate: SYSTEM_PROMPT_TEMPLATE_OCR,
      humanTemplate: `
        List: {query}
        `,
    }),
    TypeOrmModule.forFeature([VendorInvoice]),
  ],

  controllers: [GeneralVendorInvoiceController, VendorInvoiceController],
  providers: [VendorInvoiceService],
  exports: [VendorInvoiceService],
})
export class VendorInvoiceModule {}
