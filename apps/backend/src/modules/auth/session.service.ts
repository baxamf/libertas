import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service.js';
import type { JwtConfig } from '../../config/app.config.js';
import type { JwtPayload, User } from '@repo/shared-types';
import type { PrismaClientOrTx } from '../database/prisma.service.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private getExpiresAt(): Temporal.Instant {
    const jwtConf = this.configService.get<JwtConfig>('JWT')!;
    return Temporal.Now.instant().add({
      seconds: jwtConf.refreshExpiresInSeconds,
    });
  }

  async createSession(
    { userId, email, role }: Pick<User, 'userId' | 'email' | 'role'>,
    device = 'unknown',
    prismaTransaction: PrismaClientOrTx = this.prisma,
  ): Promise<JwtPayload> {
    const jti = crypto.randomUUID();
    const expiresAt = this.getExpiresAt();
    const jwtPayload: JwtPayload = { sub: userId, email, role, jti };

    await prismaTransaction.orm.public.UserSession.create({
      userId,
      jti,
      expiresAt,
      device,
    });

    return jwtPayload;
  }

  async rotateSession(
    oldJti: string,
    userId: User['userId'],
  ): Promise<JwtPayload> {
    try {
      const result = await this.prisma.db.transaction(async (tx) => {
        const user = await tx.orm.public.User.select('email', 'role')
          .where({ userId })
          .first();

        if (!user) {
          throw new UnauthorizedException(
            `User ${userId} not found during session rotation`,
          );
        }

        const { email, role } = user;

        const jti = crypto.randomUUID();
        const expiresAt = this.getExpiresAt();
        const jwtPayload: JwtPayload = { sub: userId, email, role, jti };

        const session = await tx.orm.public.UserSession.where({
          jti: oldJti,
        }).update({
          jti,
          expiresAt,
        });

        if (!session) {
          throw new UnauthorizedException(
            `Session jti: ${oldJti} not found during session rotation`,
          );
        }

        return jwtPayload;
      });

      return result;
    } catch (error) {
      if (error instanceof Error)
        Logger.error(
          `Failed to rotate session for user ${userId}: ${error.message}`,
          SessionService.name,
        );
      throw new UnauthorizedException('No valid session');
    }
  }

  async revokeSession(jti: string): Promise<void> {
    await this.prisma.orm.public.UserSession.where({ jti }).delete();
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.orm.public.UserSession.where({ userId }).deleteAll();
  }

  async getSession(jti: string) {
    return this.prisma.orm.public.UserSession.where({ jti }).first();
  }

  async getUserSessions(userId: string) {
    return this.prisma.orm.public.UserSession.where({ userId })
      .orderBy((s) => s.expiresAt.desc())
      .all();
  }
}
