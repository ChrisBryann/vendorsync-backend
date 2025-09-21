import {
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVendorPerformanceMetricsDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  totalSpend: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  avgInvoiceAmount: number;

  @IsInt()
  invoiceCount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  paymentConsistency: number; // 0–100 score

  @IsString()
  spendTrend: string; // "increasing" | "decreasing" | "stable"

  @IsObject()
  seasonalPatterns: object; // Monthly spending patterns

  @IsOptional()
  @IsObject()
  aiInsights: object | null | undefined;

  @IsNumber({ maxDecimalPlaces: 2 })
  complianceScore: number;

  @IsDateString()
  analysisDate: string;

  @IsInt()
  analysisPeriodDays: number;
}
