import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------- ENUMS ----------
export enum ProcessingConfidence {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export enum DocumentLayout {
  standard = 'standard',
  complex = 'complex',
  damaged = 'damaged',
}

// ---------- NESTED CLASSES ----------
class VendorInformationData {
  @IsOptional()
  @IsString()
  text: string | null | undefined;
}

class Description {
  @IsOptional()
  @IsString()
  text: string | null | undefined;
}

class Quantity {
  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  numeric_value: number | null | undefined;
}

class Amount {
  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  numeric_value: number | null | undefined;
}

class FinancialDataLineItemData {
  @IsOptional()
  @ValidateNested()
  @Type(() => Description)
  description: Description | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => Quantity)
  quantity: Quantity | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount | null | undefined;
}

// class ExtractionIssueData {
//   @IsOptional()
//   @IsString()
//   issue_type: string; | null | undefined

//   @IsOptional()
//   @IsString()
//   description: string; | null | undefined

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   affected_fields: string[] = [];

//   @IsOptional()
//   @IsString()
//   suggested_action: string; | null | undefined
// }

// class ExtractionMetadata {
//   @IsOptional()
//   @IsEnum(ProcessingConfidence)
//   processing_confidence: Process | null | undefinedingConfidence;

//   @IsOptional()
//   @IsEnum(DocumentLayout)
//   document_layout: Documen | null | undefinedtLayout;

//   @IsOptional()
//   @IsNumber()
//   total_text_elements: number; | null | undefined

//   @IsOptional()
//   @IsNumber()
//   high_confidence_elements: number; | null | undefined
// }

class ContactInformation {
  @IsOptional()
  @ValidateNested()
  @Type(() => VendorInformationData)
  phone: VendorInformationData | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorInformationData)
  email: VendorInformationData | null | undefined;
}

class VendorInformation {
  @IsOptional()
  @ValidateNested()
  @Type(() => VendorInformationData)
  company_name: VendorInformationData | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorInformationData)
  address: VendorInformationData | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInformation)
  contact: ContactInformation | null | undefined;
}

class InvoiceNumber {
  @IsOptional()
  @IsString()
  text: string | null | undefined;
}

class InvoiceDate {
  @IsOptional()
  @IsString()
  text: string | null | undefined;
}

class DueDate {
  @IsOptional()
  @IsString()
  text: string | null | undefined;
}

class TotalAmount {
  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  numeric_value: number | null | undefined;
}

class Subtotal {
  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  numeric_value: number | null | undefined;
}

class Tax {
  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  numeric_value: number | null | undefined;
}

class EarlyPayDiscount {
  @IsOptional()
  @IsBoolean()
  found: boolean | null | undefined;

  @IsOptional()
  @IsString()
  text: string | null | undefined;

  @IsOptional()
  @IsNumber()
  percentage: number | null | undefined;

  @IsOptional()
  @IsNumber()
  days: number | null | undefined;
}

class LateFee {
  @IsOptional()
  @IsBoolean()
  found: boolean | null | undefined;

  @IsOptional()
  @IsNumber()
  percentage: number | null | undefined;

  @IsOptional()
  @IsString()
  period: string | null | undefined;
}

class PaymentTerms {
  @IsOptional()
  @IsString()
  terms_text: string | null | undefined;

  @IsOptional()
  @IsString()
  standardized: string | null | undefined;

  @IsOptional()
  @IsNumber()
  confidence: number | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => EarlyPayDiscount)
  early_pay_discount: EarlyPayDiscount | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => LateFee)
  late_fee: LateFee | null | undefined;
}

class FinancialData {
  @IsOptional()
  @ValidateNested()
  @Type(() => TotalAmount)
  total_amount: TotalAmount | null | undefined;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinancialDataLineItemData)
  line_items: FinancialDataLineItemData[] = [];

  @IsOptional()
  @ValidateNested()
  @Type(() => Subtotal)
  subtotal: Subtotal | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => Tax)
  tax: Tax | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentTerms)
  payment_terms: PaymentTerms | null | undefined;
}

class InvoiceDetails {
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceNumber)
  invoice_number: InvoiceNumber | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceDate)
  invoice_date: InvoiceDate | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => DueDate)
  due_date: DueDate | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => FinancialData)
  financial_data: FinancialData | null | undefined;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => ExtractionIssueData)
  // extraction_issues: ExtractionIssueData[] = [];
}

// ---------- FINAL DTO ----------
export class UploadInvoiceResponseDto {
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => ExtractionMetadata)
  // extraction_metadata: Extract | null | undefinedionMetadata;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorInformation)
  bill_to: VendorInformation | null | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceDetails)
  invoice_details: InvoiceDetails | null | undefined;
}
