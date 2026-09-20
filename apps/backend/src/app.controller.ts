import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { IsPublic } from './core/decorators/is-public.decorator.js';
import { PrismaService } from './modules/database/prisma.service.js';

@SkipThrottle({ auth: true })
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @IsPublic()
  @Get('health')
  async health() {
    return this.prisma.healthCheck();
  }
}
