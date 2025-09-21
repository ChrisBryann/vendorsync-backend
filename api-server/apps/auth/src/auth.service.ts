import { CLERK_PROVIDER } from '@app/common/constants';
import { User } from '@app/common/database/entities';
import { ClerkClient } from '@clerk/backend';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CLERK_PROVIDER) private readonly clerkClient: ClerkClient,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(clerkId: string): Promise<User> {
    return await this.userRepository.save(
      this.userRepository.create({
        clerkId,
      }),
    );
  }

  async findUser(clerkId: string): Promise<User> {
    return await this.userRepository.manager.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({
        where: {
          clerkId,
        },
      });

      if (!user) {
        throw new NotFoundException('User does not exist!');
      }

      return user;
    });
  }
}
