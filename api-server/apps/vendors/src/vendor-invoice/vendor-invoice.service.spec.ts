import { Test, TestingModule } from '@nestjs/testing';
import { VendorInvoiceService } from './vendor-invoice.service';

describe('VendorInvoiceService', () => {
  let service: VendorInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorInvoiceService],
    }).compile();

    service = module.get<VendorInvoiceService>(VendorInvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
