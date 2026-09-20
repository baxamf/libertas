import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { JwtPayload, UserProfile } from '@repo/shared-types';
import { PrismaService } from '../../database/prisma.service.js';

export class GetProfileQuery extends Query<UserProfile> {
  constructor(public readonly dto: Pick<JwtPayload, 'sub' | 'jti'>) {
    super();
  }
}

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ dto }: GetProfileQuery) {
    const { sub: userId, jti: currentJti } = dto;

    const profile = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({ userId })
      .include('userSessions', (session) =>
        session
          .select('sessionId', 'jti', 'createdAt', 'expiresAt', 'device')
          .orderBy((s) => s.expiresAt.desc()),
      )
      .first();

    if (!profile) {
      throw new NotFoundException(`Profile with id "${userId}" not found`);
    }

    const { userSessions, ...user } = profile;

    return {
      ...user,
      userSessions: userSessions.map(({ jti, ...session }) => ({
        ...session,
        isCurrent: jti === currentJti,
      })),
    };
  }
}
