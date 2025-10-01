import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CurrentUserDecorator } from '@app/common/decorators';
import { User } from '@clerk/backend';
import { Vendor } from '@app/common/database/entities';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendor')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // @Get()
  // getHello(): string {
  //   return this.vendorsService.getHello();
  // }

  @Post()
  async create(
    @CurrentUserDecorator() user: User,
    @Body() createVendorDto: CreateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorsService.create(
      user.publicMetadata.userId as string,
      createVendorDto,
    );
  }

  @Get()
  async findAll(@CurrentUserDecorator() user: User): Promise<Vendor[]> {
    return await this.vendorsService.findAll(
      user.publicMetadata.userId as string,
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUserDecorator() user: User,
    @Param('id') id: string,
  ): Promise<Vendor> {
    return await this.vendorsService.findOne(
      user.publicMetadata.userId as string,
      id,
    );
  }

  @Patch(':id')
  async update(
    @CurrentUserDecorator() user: User,
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorsService.update(
      user.publicMetadata.userId as string,
      id,
      updateVendorDto,
    );
  }

  @Delete(':id')
  async delete(
    @CurrentUserDecorator() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.vendorsService.remove(user.publicMetadata.userId as string, id);
  }
}
