import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { User } from '@repo/shared-types';
import { PrismaService } from '../../database/prisma.service.js';

export class GetUserByIdQuery extends Query<User> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  User
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    const user = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({
        userId: query.id,
      })
      .first();

    if (!user) {
      throw new NotFoundException(`User with id "${query.id}" not found`);
    }

    return user;
  }
}
