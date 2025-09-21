import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorPerformanceMetrics } from '@app/common/database/entities';
import { Repository } from 'typeorm';
import { UpdateVendorPerformanceMetricsDto } from './dto/update-vendor-performance.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class VendorPerformanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(VendorPerformanceMetrics.name);
  private pgClient: Client;

  // Rate limiting configuration
  private readonly DEBOUNCE_MINUTES = 5; // Wait 5 minutes before generating insights
  private readonly BATCH_SIZE = 10; // Process up to 10 insights per batch
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('VENDOR_PERFORMANCE_QUEUE')
    private readonly vendorPerformanceQueue: Queue,
    @InjectRepository(VendorPerformanceMetrics)
    private readonly vendorPerformanceRepository: Repository<VendorPerformanceMetrics>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    this.pgClient = new Client({
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port: +this.configService.getOrThrow<string>('DB_PORT'),
      user: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.getOrThrow<string>('DB_NAME'),
    });

    await this.pgClient.connect();

    await this.pgClient.query('LISTEN vendor_metrics_updated');

    this.pgClient.on('notification', async (msg) => {
      this.logger.log(
        `pgClient notification - channel: ${msg.channel} payload: ${msg.payload}`,
      );
      if (msg.channel === 'vendor_metrics_updated') {
        const payload = JSON.parse(msg.payload);
        // await this.vendorPerformanceQueue.add('handleAiInsights', payload);
        const shouldGenerate = await this.shouldGenerateInsights(payload);
        if (shouldGenerate) {
          await this.scheduleDebouncedJob(payload, 'handleAiInsights');
        } else {
          this.logger.log(
            `Insights generation debounced for user ${payload.user_id}`,
          );
        }
      }
    });
  }

  async onModuleDestroy() {
    if (this.pgClient) {
      await this.pgClient.end();
    }
  }

  private async scheduleDebouncedJob(payload: any, event: string) {
    const key = this.getPayloadKey(payload);
    try {
      await this.vendorPerformanceQueue.add(
        event,
        {
          ...payload,
          key,
          scheduledAt: Date.now(),
        },
        {
          delay: this.DEBOUNCE_MINUTES * 60 * 1000,
          removeOnComplete: 10,
          removeOnFail: 5,
          jobId: `insights_${key}`,
          attempts: 2,
          backoff: {
            type: 'exponential',
          },
        },
      );
      this.logger.log(`Scheduled debounced AI insights for ${key}`);
    } catch (error) {
      // Clear pending flag if job scheduling fails
      await this.cacheManager.del(`insights_pending:${key}`);
      this.logger.error(`Failed to schedule debounced job for ${key}:`, error);
    }
  }
  private getPayloadKey(payload: any) {
    // Create unique key based on user and vendor (if specified)
    const userId = payload.user_id || payload.userId;
    const vendorId = payload.vendor_id || payload.vendorId;
    return vendorId ? `${userId}_${vendorId}` : `${userId}_portfolio`;
  }

  private async shouldGenerateInsights(payload: {
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
  }) {
    const key = this.getPayloadKey(payload);
    try {
      // check when insights were last generated
      const lastGenerated = await this.cacheManager.get<number>(
        `insights_last:${key}`,
      );
      const now = Date.now();
      const debounceMs = this.DEBOUNCE_MINUTES * 60 * 1000;

      if (lastGenerated && now - lastGenerated < debounceMs) {
        const remainingSeconds = Math.ceil(
          (debounceMs - (now - lastGenerated)) / 1000,
        );
        this.logger.log(
          `Insights debounced for ${key} - ${remainingSeconds}s remaining`,
        );
        return false;
      }

      // check if insights are already pending
      const isPending = await this.cacheManager.get<boolean>(
        `insights_pending:${key}`,
      );
      if (isPending) {
        this.logger.log(`Insights already pending for ${key}`);
        return false;
      }

      // Mark as pending to prevent duplicate jobs
      await this.cacheManager.set(
        `insights_pending:${key}`,
        true,
        (this.DEBOUNCE_MINUTES + 2) * 60 * 1000, // Expires in 7 minutes
      );

      return true;
    } catch (error) {
      this.logger.error(`Cache error in shouldGenerateInsights:`, error);
      return false; // Fail safe - don't generate if cache fails
    }
  }
  async getAllPerformanceAnalysis(userId: string) {
    const metrics = await this.vendorPerformanceRepository
      .createQueryBuilder('vendorPerformanceMetrics')
      .innerJoin('vendorPerformanceMetrics.user', 'user')
      .addSelect('user.id')
      .where('user.id = :userId', { userId })
      .getMany();

    return metrics.map((metric) => {
      const { aiInsights: _, ...rest } = metric;

      return rest;
    });
  }

  async getPerformanceAnalysis(userId: string, vendorId: string) {
    const metrics = await this.vendorPerformanceRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        vendor: {
          id: vendorId,
        },
      },
    });

    if (!metrics) {
      throw new NotFoundException(
        'Vendor performance metrics with given vendor ID does not exist!',
      );
    }

    const { aiInsights: _, ...performanceAnalysis } = metrics;
    return performanceAnalysis;
  }

  async getAllAiInsights(userId: string) {
    const aiInsights = await this.vendorPerformanceRepository
      .createQueryBuilder('vendorPerformanceMetrics')
      .innerJoin('vendorPerformanceMetrics.user', 'user')
      .addSelect('user.id')
      .innerJoin('vendorPerformanceMetrics.vendor', 'vendor')
      .addSelect('vendor.id')
      .where('user.id = :userId', { userId })
      .select(['vendor.id', 'vendorPerformanceMetrics.aiInsights'])
      .getMany();

    return aiInsights;
  }

  async getAiInsights(userId: string, vendorId: string) {
    const metrics = await this.vendorPerformanceRepository
      .createQueryBuilder('vendorPerformanceMetrics')
      .innerJoin('vendorPerformanceMetrics.user', 'user')
      .addSelect('user.id')
      .innerJoin('vendorPerformanceMetrics.vendor', 'vendor')
      .addSelect('vendor.id')
      .where('user.id = :userId', { userId })
      .andWhere('vendor.id = :vendorId', { vendorId })
      .select(['vendor.id', 'vendorPerformanceMetrics.aiInsights'])
      .getOne();
    if (!metrics) {
      throw new NotFoundException(
        'AI insights with given vendor ID does not exist!',
      );
    }
    const { aiInsights } = metrics;
    return aiInsights;
  }

  async findOne(userId: string, vendorId: string, id: string) {
    const metrics = await this.vendorPerformanceRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
        vendor: {
          id: vendorId,
        },
      },
    });

    if (!metrics) {
      throw new NotFoundException(
        'Vendor performance metrics with given ID does not exist!',
      );
    }

    return metrics;
  }
  async update(
    userId: string,
    vendorId: string,
    id: string,
    updateVendorPerformanceMetricsDto: UpdateVendorPerformanceMetricsDto,
  ) {
    const metrics = await this.findOne(userId, vendorId, id);
    Object.assign(metrics, updateVendorPerformanceMetricsDto);

    return await this.vendorPerformanceRepository.save(metrics);
  }
}
