import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VendorInvoiceService } from '../vendor-invoice/vendor-invoice.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsSchedulerService {
  private readonly logger: Logger = new Logger(PaymentsSchedulerService.name);
  constructor(
    @Inject('WEBSOCKETS_SERVICE')
    private readonly websocketsService: ClientProxy,
    private readonly vendorInvoiceService: VendorInvoiceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkOverduePayments() {
    this.logger.log('Checking overdue payments....');
    try {
      const overdueInvoices =
        await this.vendorInvoiceService.getOverdueInvoices();
      overdueInvoices.forEach((invoice) => {
        this.logger.log(`${invoice.userId} ${invoice.invoiceCount}`);
        this.websocketsService.emit('websockets_custom_event', {
          userId: invoice.userId,
          event: 'overdue_payments',
          payload: {
            message: `You have ${invoice.invoiceCount} invoices that are overdue.`,
          },
        });
      });
    } catch (error) {
      this.logger.error('Failed to check overdue payments', error);
    }
  }
}
