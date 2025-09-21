import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../default.entity';
import { User } from './user';
import { Vendor } from './vendor';
import { InvoiceStatus } from '@app/common/enums/invoice-status.enum';

@Entity()
export class VendorInvoice extends DefaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @Column({
    type: 'varchar',
    length: 255,
  })
  invoiceNumber: string;

  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date) => value.toISOString().slice(0, 10),
    },
  })
  date: Date;

  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date | undefined) =>
        value ? value.toISOString().slice(0, 10) : null,
    },
  })
  dueDate: Date | undefined;

  @Column({
    type: 'decimal',
    scale: 2,
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    scale: 2,
  })
  totalAmount: number;

  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date | undefined) =>
        value ? value.toISOString().slice(0, 10) : null,
    },
  })
  paidDate: Date | null | undefined;

  @Column({
    type: 'decimal',
    scale: 2,
    nullable: true,
  })
  paidAmount: number | null | undefined;

  @Column({ type: 'enum', default: InvoiceStatus.pending, enum: InvoiceStatus }) // pending, paid, overdue
  status: InvoiceStatus;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: true,
  })
  paymentTerms: string | null | undefined;

  @Column({
    type: 'decimal',
    precision: 2,
    // transformer: {
    //   // PostgreSQL returns int as string, so turn it to a Decimal object
    //   to: (value: number | Decimal) =>
    //     typeof value === 'number' ? value : value.toString(),
    //   from: (value: string) => new Decimal(value),
    // },
    nullable: true,
  })
  earlyPayDiscount: number | null | undefined;

  @Column({ type: 'int', default: 0 })
  earlyPayDays: number | null | undefined; // Pay within X days for discount
}
