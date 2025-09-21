import { forwardRef, Module } from '@nestjs/common';
import { VendorInvoiceModule } from '../vendor-invoice/vendor-invoice.module';
import { PaymentsSchedulerService } from './payments-scheduler.service';

@Module({
  imports: [forwardRef(() => VendorInvoiceModule)],
  providers: [PaymentsSchedulerService],
})
export class PaymentsModule {}
