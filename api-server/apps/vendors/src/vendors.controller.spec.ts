import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

describe('VendorController', () => {
  let vendorController: VendorsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [VendorsService],
    }).compile();

    vendorController = app.get<VendorsController>(VendorsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(vendorController.getHello()).toBe('Hello World!');
    });
  });
});
