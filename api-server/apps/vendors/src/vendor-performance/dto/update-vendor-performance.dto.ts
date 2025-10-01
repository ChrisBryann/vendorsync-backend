import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorPerformanceMetricsDto } from './create-vendor-performance.dto';

export class UpdateVendorPerformanceMetricsDto extends PartialType(
  CreateVendorPerformanceMetricsDto,
) {}
