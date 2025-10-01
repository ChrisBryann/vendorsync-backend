import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { VendorInvoiceService } from './vendor-invoice.service';
import { CreateVendorInvoiceDto } from './dto/create-vendor-invoice.dto';
import { UpdateVendorInvoiceDto } from './dto/update-vendor-invoice.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserDecorator } from '@app/common/decorators';
import { UploadInvoiceResponseDto } from './dto/upload-invoice.dto';
import { AIMessage } from '@langchain/core/messages';
import { User } from '@clerk/backend';
import { VendorInvoice } from '@app/common/database/entities';

@Controller('/vendor/invoice')
export class GeneralVendorInvoiceController {
  constructor(private readonly vendorInvoiceService: VendorInvoiceService) {}

  @Get('all')
  async findAll(@CurrentUserDecorator() user: User): Promise<VendorInvoice[]> {
    return await this.vendorInvoiceService.findAllByUser(
      user.publicMetadata.userId as string,
    );
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
      },
    }),
  )
  async uploadInvoice(
    @CurrentUserDecorator() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadInvoiceResponseDto | AIMessage> {
    return await this.vendorInvoiceService.uploadInvoice(
      user.publicMetadata.userId as string,
      file,
    );
  }
}

@Controller('/vendor/:vendorId/invoice')
export class VendorInvoiceController {
  constructor(private readonly vendorInvoiceService: VendorInvoiceService) {}

  @Post()
  create(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
    @Body() createVendorInvoiceDto: CreateVendorInvoiceDto,
  ): Promise<VendorInvoice> {
    return this.vendorInvoiceService.create(
      user.publicMetadata.userId as string,
      vendorId,
      createVendorInvoiceDto,
    );
  }

  @Get()
  findAll(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
  ): Promise<VendorInvoice[]> {
    return this.vendorInvoiceService.findAll(
      user.publicMetadata.userId as string,
      vendorId,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
  ): Promise<VendorInvoice> {
    return this.vendorInvoiceService.findOne(
      user.publicMetadata.userId as string,
      vendorId,
      id,
    );
  }

  @Patch(':id')
  update(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
    @Body() updateVendorInvoiceDto: UpdateVendorInvoiceDto,
  ): Promise<VendorInvoice> {
    return this.vendorInvoiceService.update(
      user.publicMetadata.userId as string,
      vendorId,
      id,
      updateVendorInvoiceDto,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUserDecorator() user: User,
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.vendorInvoiceService.remove(
      user.publicMetadata.userId as string,
      vendorId,
      id,
    );
  }
}
