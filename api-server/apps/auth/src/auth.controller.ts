import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk.guard';
import { HttpInterceptor } from '@app/common/http/http.interceptor';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentUserDecorator } from '@app/common/decorators';
import { User } from '@clerk/backend';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(HttpInterceptor)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUserDecorator() user: User): Promise<User> {
    return user;
  }
}
