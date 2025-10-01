import { Controller, Get, Param } from '@nestjs/common';
import { VendorPerformanceService } from './vendor-performance.service';
import { CurrentUserDecorator } from '@app/common/decorators';
import { User } from '@clerk/backend';

@Controller('/vendor/performance')
export class GeneralVendorPerformanceController {
  constructor(
    private readonly vendorPerformanceService: VendorPerformanceService,
  ) {}

  @Get('all')
  async getAllPerformanceAnalysis(@CurrentUserDecorator() user: User) {
    return await this.vendorPerformanceService.getAllPerformanceAnalysis(
      user.publicMetadata.userId as string,
    );
  }

  @Get('ai-insights')
  async getAllAiInsights(@CurrentUserDecorator() user: User) {
    return await this.vendorPerformanceService.getAllAiInsights(
      user.publicMetadata.userId as string,
    );
  }
}

@Controller('/vendor/:vendorId/performance')
export class VendorPerformanceController {
  constructor(
    private readonly vendorPerformanceService: VendorPerformanceService,
  ) {}

  @Get()
  async getPerformanceAnalysis(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
  ) {
    return await this.vendorPerformanceService.getPerformanceAnalysis(
      user.publicMetadata.userId as string,
      vendorId,
    );
  }
  @Get('ai-insights')
  async getAiInsights(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
  ) {
    return await this.vendorPerformanceService.getAiInsights(
      user.publicMetadata.userId as string,
      vendorId,
    );
  }
}
