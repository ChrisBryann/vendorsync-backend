import { InvoiceStatus } from '@app/common/enums/invoice-status.enum';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  isISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVendorInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @Transform(({ value }) => {
    // transformers happens first before validators
    console.log(value);
    const isValidDate = isISO8601(value, {
      strict: true,
    });
    if (!isValidDate) {
      throw new Error(`Property "date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsNotEmpty()
  date: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return null; // preserve null for optional field
    }
    // transformers happens first before validators
    const isValidDate = isISO8601(value, {
      strict: true,
    });
    if (!isValidDate) {
      throw new Error(
        `Property "dueDate" should be a valid ISO8601 date string`,
      );
    }

    return new Date(value);
  })
  dueDate: Date | null | undefined;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsNotEmpty()
  subtotal: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsNotEmpty()
  totalAmount: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return null; // preserve null for optional field
    }
    // transformers happens first before validators
    const isValidDate = isISO8601(value, {
      strict: true,
    });
    if (!isValidDate) {
      throw new Error(
        `Property "paidDate" should be a valid ISO8601 date string`,
      );
    }

    return new Date(value);
  })
  paidDate: Date | null | undefined;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsOptional()
  paidAmount: number | null | undefined;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus = InvoiceStatus.pending;

  @IsString()
  paymentTerms: string | null | undefined;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  earlyPayDiscount: number | null | undefined;
}
