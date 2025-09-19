import { Controller, Get } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  getHello(): string {
    return this.vendorsService.getHello();
  }
}
