import { Test, TestingModule } from '@nestjs/testing';
import { VendorInvoiceController } from './vendor-invoice.controller';
import { VendorInvoiceService } from './vendor-invoice.service';

describe('VendorInvoiceController', () => {
  let controller: VendorInvoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorInvoiceController],
      providers: [VendorInvoiceService],
    }).compile();

    controller = module.get<VendorInvoiceController>(VendorInvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
