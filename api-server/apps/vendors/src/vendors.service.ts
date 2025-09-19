import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorsService {
  getHello(): string {
    return 'Hello World!';
  }
}
