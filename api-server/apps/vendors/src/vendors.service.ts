import { Vendor } from '@app/common/database/entities';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async create(userId: string, createVendorDto: CreateVendorDto) {
    try {
      await this.findOneByEmail(userId, createVendorDto.email);
      await this.findOneByName(userId, createVendorDto.name);
    } catch {
      return await this.vendorRepository.save(
        await this.vendorRepository.create({
          ...createVendorDto,
          user: {
            id: userId,
          },
        }),
      );
    }

    throw new ForbiddenException('Vendor with given name/email already exist!');
  }

  async findAll(userId: string): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor with given ID does not exist!');
    }

    return vendor;
  }

  async findOneByEmail(userId: string, email?: string): Promise<Vendor> {
    const vendor = await this.vendorRepository
      .createQueryBuilder('vendor')
      .innerJoin('vendor.user', 'user')
      .addSelect('user.id')
      .where('vendor.email = :email', { email })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!vendor) {
      throw new NotFoundException('Vendor with given email does not exist!');
    }

    return vendor;
  }

  async findOneByName(userId: string, name: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: {
        name,
        user: {
          id: userId,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor with given name does not exist!');
    }

    return vendor;
  }

  async update(
    userId: string,
    id: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const vendor = await this.findOne(userId, id);
    Object.assign(vendor, updateVendorDto);

    return await this.vendorRepository.save(vendor);
  }

  async remove(userId: string, id: string) {
    const vendor = await this.findOne(userId, id);
    await this.vendorRepository.remove(vendor);
  }
}
