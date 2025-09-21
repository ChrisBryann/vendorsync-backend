import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

enum InsightsType {
  costOptimization = 'cost_optimization',
  dataQuality = 'data_quality',
  performanceWarning = 'performance_warning',
  processImprovement = 'process_improvement',
}

enum Priority {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

enum FinancialImpactType {
  savings = 'savings',
  costAvoidance = 'cost_avoidance',
  revenueOpportunity = 'revenue_opportunity',
}

enum FinancialImpactTimeframe {
  immediate = 'immediate',
  month3 = '3_months',
  month6 = '6_months',
  annual = 'annual',
}

class FinancialImpact {
  @IsEnum(FinancialImpactType)
  @IsNotEmpty()
  type: FinancialImpactType;

  @IsNumber()
  @IsNotEmpty()
  estimatedAmount: number;

  @IsEnum(FinancialImpactTimeframe)
  @IsNotEmpty()
  timeframe: FinancialImpactTimeframe;
}

class RiskFactors {
  @IsEnum(Priority)
  level: Priority;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class GenerateAiInsightsResponseDto {
  @IsNotEmpty()
  @IsEnum(InsightsType)
  insightsType: InsightsType;

  @IsNotEmpty()
  @IsEnum(Priority)
  priority: Priority;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  impact: string;

  @IsArray()
  actionItems: string[];

  @IsNumber()
  @IsNotEmpty()
  confidence: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FinancialImpact)
  financialImpact: FinancialImpact;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RiskFactors)
  riskFactors: RiskFactors;
}
