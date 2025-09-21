import { forwardRef, Module } from '@nestjs/common';
import { VendorsModule } from '../vendors.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorPerformanceMetrics } from '@app/common/database/entities';
import { VendorPerformanceService } from './vendor-performance.service';
import { LlmModule } from '@app/common/llm/llm.module';
import { SYSTEM_PROMPT_TEMPLATE_AI_INSIGHTS } from '@app/common/constants';
import { GenerateAiInsightsResponseDto } from './dto/generate-ai-insights.dto';
import { BmqModule } from '@app/common/bullmq/bullmq.module';
import {
  GeneralVendorPerformanceController,
  VendorPerformanceController,
} from './vendor-perfromance.controller';
import { VendorPerformanceConsumer } from './vendor-performance.consumer';

@Module({
  imports: [
    forwardRef(() => VendorsModule),
    TypeOrmModule.forFeature([VendorPerformanceMetrics]),
    LlmModule.register({
      enableStructuredOutput: true,
      structuredOutputSchema: GenerateAiInsightsResponseDto,
      systemTemplate: SYSTEM_PROMPT_TEMPLATE_AI_INSIGHTS,
      humanTemplate: `
                VendorPerformanceMetrics object: {query}
                `,
    }),
    BmqModule.register(['VENDOR_PERFORMANCE_QUEUE']),
  ],
  controllers: [
    GeneralVendorPerformanceController,
    VendorPerformanceController,
  ],
  providers: [VendorPerformanceService, VendorPerformanceConsumer],
})
export class VendorPerformanceModule {}
