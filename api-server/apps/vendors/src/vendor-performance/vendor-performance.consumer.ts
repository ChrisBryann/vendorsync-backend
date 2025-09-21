import { LlmService } from '@app/common/llm/llm.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { VendorPerformanceService } from './vendor-performance.service';
import { Job } from 'bullmq';
import { GenerateAiInsightsResponseDto } from './dto/generate-ai-insights.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Processor('VENDOR_PERFORMANCE_QUEUE')
export class VendorPerformanceConsumer extends WorkerHost {
  private readonly logger: Logger = new Logger(VendorPerformanceConsumer.name);
  constructor(
    private readonly llmService: LlmService,
    private readonly vendorPerformanceService: VendorPerformanceService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    void token;

    switch (job.name) {
      case 'handleAiInsights': {
        const payload: {
          id: string;
          vendorId: string;
          userId: string;
          totalSpend: number;
          avgInvoiceAmount: number;
          invoiceCount: number;
          paymentConsistency: number;
          spendTrend: string;
          seasonalPatterns: any;
          analysisDate: string;
          analysisPeriodDays: number;
          key: string;
          scheduledAt: number;
        } = job.data;

        try {
          await this.cacheManager.del(`insights_pending:${payload.key}`);

          // Check if there were more recent updates during debounce period
          //   const latestUpdate = await this.cacheManager.get<number>(
          //     `latest_update:${payload.key}`,
          //   );
          //   if (latestUpdate && latestUpdate > payload.scheduledAt) {
          //     this.logger.log(
          //       `Skipping debounced insights - newer update detected for ${payload.key}`,
          //     );
          //     return { status: 'skipped', reason: 'newer_update_exists' };
          //   }
          const aiInsights =
            await this.llmService.invoke<GenerateAiInsightsResponseDto>(
              JSON.stringify(payload),
              true,
            );

          // Mark as completed with timestamp
          await this.cacheManager.set(
            `insights_last:${payload.key}`,
            Date.now(),
            24 * 60 * 60 * 1000, // 24 hours
          );

          await this.vendorPerformanceService.update(
            payload.userId,
            payload.vendorId,
            payload.id,
            {
              aiInsights,
            },
          );

          break;
        } catch (error) {
          this.logger.error(
            `Debounced AI insights failed for ${payload.key}:`,
            error,
          );
          // Clear pending flag on error
          await this.cacheManager.del(`insights_pending:${payload.key}`);
          throw error;
        }
      }
      default:
        break;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: any) {
    this.logger.log(
      `Job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)} has failed.\nError details: ${error}`,
    );
  }

  @OnWorkerEvent('error')
  onError(failedReason: any) {
    this.logger.log(
      `Error occured while running job: ${JSON.stringify(failedReason)}.`,
    );
  }
}
