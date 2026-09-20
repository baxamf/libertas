import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { db } from '@repo/db';

export type PrismaTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export type PrismaClientOrTx = PrismaService | PrismaTransaction;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public readonly db = db;

  get orm() {
    return this.db.orm;
  }

  get sql() {
    return this.db.sql;
  }

  async onModuleInit() {
    await this.db.connect();
    this.logger.log('✅ Prisma 8 Database initialized');
  }

  async onModuleDestroy() {
    await this.db.close();
    this.logger.log('✅ Prisma 8 Database disconnected');
  }

  async healthCheck() {
    try {
      await this.db.orm.public.User.limit(1).all();
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: `${error instanceof Error ? error.message : 'Database connection error'}`,
      };
    }
  }
}
