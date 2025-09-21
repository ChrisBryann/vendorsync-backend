import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateVendorInvoiceDto } from './dto/create-vendor-invoice.dto';
import { UpdateVendorInvoiceDto } from './dto/update-vendor-invoice.dto';
import { UploadOcrResponseDto } from './dto/upload-ocr.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorInvoice } from '@app/common/database/entities';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { LlmService } from '@app/common/llm/llm.service';
import { UploadInvoiceResponseDto } from './dto/upload-invoice.dto';
import { VendorsService } from '../vendors.service';
import { InvoiceStatus } from '@app/common/enums/invoice-status.enum';
interface InvoiceOCRService {
  // make sure data properties are camelCase, not snake_case in TS
  uploadInvoice(data: {
    fileType: string; // maps to file_type in the python server
    imageData: Buffer | Uint8Array; // maps to image_data in the python server
  }): Observable<UploadOcrResponseDto[]>;
}

@Injectable()
export class VendorInvoiceService implements OnModuleInit {
  private invoiceOCRService: InvoiceOCRService;
  constructor(
    @InjectRepository(VendorInvoice)
    private readonly vendorInvoiceRepository: Repository<VendorInvoice>,
    @Inject('OCR_PACKAGE') private client: ClientGrpc,
    private readonly llmService: LlmService,
    private readonly vendorsService: VendorsService,
  ) {}

  async onModuleInit() {
    this.invoiceOCRService =
      this.client.getService<InvoiceOCRService>('InvoiceOCR');
  }

  async uploadInvoice(userId: string, file: Express.Multer.File) {
    try {
      let ocrResult: UploadOcrResponseDto[];
      if (file.mimetype.includes('image') || file.mimetype.includes('pdf')) {
        ocrResult = await firstValueFrom(
          this.invoiceOCRService.uploadInvoice({
            fileType: file.mimetype,
            imageData: file.buffer,
          }),
        );
      } else {
        throw new ForbiddenException(
          'uploadInvoice - File provided is not an image or PDF!',
        );
      }
      if (!ocrResult) {
        throw new InternalServerErrorException(
          `uploadInvoice - Invalid image content!`,
        );
      }
      // after getting result, pass it to LLM to get structured data
      const llmResult = (await this.llmService.invoke<UploadInvoiceResponseDto>(
        JSON.stringify(ocrResult),
        true,
      )) as UploadInvoiceResponseDto;

      return llmResult;
    } catch (error) {
      throw new InternalServerErrorException(
        `uploadInvoice - Error getting image structured result: ${error}`,
      );
    }
  }

  async create(
    userId: string,
    vendorId: string,
    createVendorInvoiceDto: CreateVendorInvoiceDto,
  ): Promise<VendorInvoice> {
    try {
      await this.findOneByInvoiceNumber(createVendorInvoiceDto.invoiceNumber);
    } catch {
      // if does not exist, then create a new invoice
      // first check if due date is missing
      if (!createVendorInvoiceDto.dueDate) {
        createVendorInvoiceDto.dueDate = this.calculateDueDateFromTerms(
          createVendorInvoiceDto.date,
          createVendorInvoiceDto.paymentTerms,
        );
      }

      if (
        createVendorInvoiceDto.paidAmount &&
        createVendorInvoiceDto.paidDate
      ) {
        createVendorInvoiceDto.status = InvoiceStatus.paid;
      }

      return await this.vendorInvoiceRepository.save(
        this.vendorInvoiceRepository.create({
          ...createVendorInvoiceDto,
          user: {
            id: userId,
          },
          vendor: {
            id: vendorId,
          },
        }),
      );
    }
    throw new ForbiddenException(
      'Vendor invoice with given invoice number already exist!',
    );
  }

  async findAll(userId: string, vendorId: string): Promise<VendorInvoice[]> {
    return await this.vendorInvoiceRepository.find({
      where: {
        user: {
          id: userId,
        },
        vendor: {
          id: vendorId,
        },
      },
    });
  }

  async findAllByUser(userId: string): Promise<VendorInvoice[]> {
    return await this.vendorInvoiceRepository
      .createQueryBuilder('vendorInvoice')
      .innerJoin('vendorInvoice.vendor', 'vendor')
      .addSelect('vendor.id')
      .innerJoin('vendorInvoice.user', 'user')
      .addSelect('user.id')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findOne(
    userId: string,
    vendorId: string,
    id: string,
  ): Promise<VendorInvoice> {
    const invoice = await this.vendorInvoiceRepository.findOne({
      where: {
        id,
        user: { id: userId },
        vendor: { id: vendorId },
      },
    });
    if (!invoice) {
      throw new NotFoundException(
        'Vendor invoice with given ID does not exist!',
      );
    }
    return invoice;
  }
  async findOneByInvoiceNumber(invoiceNumber: string): Promise<VendorInvoice> {
    const invoice = await this.vendorInvoiceRepository.findOne({
      where: {
        invoiceNumber,
      },
    });

    if (!invoice) {
      throw new NotFoundException(
        'Vendor invoice with given invoice number does not exist!',
      );
    }
    return invoice;
  }

  async update(
    userId: string,
    vendorId: string,
    id: string,
    updateVendorInvoiceDto: UpdateVendorInvoiceDto,
  ): Promise<VendorInvoice> {
    const invoice = await this.findOne(userId, vendorId, id);
    Object.assign(invoice, updateVendorInvoiceDto);
    return await this.vendorInvoiceRepository.save(invoice);
  }

  async remove(userId: string, vendorId: string, id: string): Promise<void> {
    const invoice = await this.findOne(userId, vendorId, id);
    await this.vendorInvoiceRepository.remove(invoice);
  }

  private calculateDueDateFromTerms(
    invoiceDate: Date,
    paymentTerms?: string,
  ): Date {
    const dueDate = new Date(invoiceDate);

    if (paymentTerms) {
      // Parse common payment terms
      const netMatch = paymentTerms.match(/net\s*(\d+)/i);
      if (netMatch) {
        const days = parseInt(netMatch[1]);
        dueDate.setDate(dueDate.getDate() + days);
        return dueDate;
      }

      // Handle other terms like "Due on receipt", "COD", etc.
      if (paymentTerms.toLowerCase().includes('receipt')) {
        return dueDate; // Due immediately
      }
    }

    // Default to Net 30
    dueDate.setDate(dueDate.getDate() + 30);
  }

  private extractPaymentTerms(
    invoiceDate: Date,
    dueDate: Date,
    paymentTerms?: string,
  ): string {
    if (paymentTerms) {
      return paymentTerms;
    }

    const daysDiff = Math.floor(
      (dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return `Net ${daysDiff}`;
  }

  async getOverdueInvoices() {
    // get all overdue payments for each user
    const invoices = await this.vendorInvoiceRepository
      .createQueryBuilder('vendor_invoice')
      .select('vendor_invoice.userId', 'userId') // or join with user if it's a relation
      .addSelect('COUNT(vendor_invoice.id)', 'invoiceCount')
      .where('vendor_invoice.status = :status', {
        status: InvoiceStatus.pending,
      })
      .andWhere('vendor_invoice.dueDate < NOW()') // only invoices past due date
      .groupBy('vendor_invoice.userId')
      .getRawMany();
    console.log(invoices);

    return invoices as { userId: string; invoiceCount: string }[];
  }
}
