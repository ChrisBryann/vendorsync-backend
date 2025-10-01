import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../default.entity';
import { Vendor } from './vendor';
import { User } from './user';

@Entity()
export class VendorPerformanceMetrics extends DefaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalSpend: number;

  @Column('decimal', { precision: 10, scale: 2 })
  avgInvoiceAmount: number;

  @Column('int')
  invoiceCount: number;

  @Column('decimal', { precision: 5, scale: 2 })
  paymentConsistency: number; // 0-100 score

  @Column('varchar')
  spendTrend: string; // 'increasing', 'decreasing', 'stable'

  @Column('json')
  seasonalPatterns: object; // Monthly spending patterns

  @Column({
    type: 'json',
    nullable: true,
  })
  aiInsights: object | null | undefined;

  @Column('decimal', { precision: 5, scale: 2 })
  complianceScore: number;

  @Column('date')
  analysisDate: Date;

  @Column('int')
  analysisPeriodDays: number;
}
