import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { User } from '@repo/shared-types';
import { PrismaService } from '../../database/prisma.service.js';

export class GetMeQuery extends Query<User> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, User> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMeQuery): Promise<User> {
    const { userId } = query;

    const user = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({ userId })
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
