import { Transform } from 'class-transformer';
import { isISO8601, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @Transform(({ value }) => {
    // transformers happens first before validators
    const isValidDate = isISO8601(value, {
      strict: true,
    });
    if (!isValidDate) {
      throw new Error(`Property "date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsNotEmpty()
  paidDate: Date;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
