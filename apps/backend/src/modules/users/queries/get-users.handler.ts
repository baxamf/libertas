import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQueryInput, PaginatedUsers } from '@repo/shared-types';
import { PrismaService } from '../../database/prisma.service.js';

export class GetUsersQuery extends Query<PaginatedUsers> {
  constructor(public readonly input: GetUsersQueryInput) {
    super();
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<
  GetUsersQuery,
  PaginatedUsers
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUsersQuery): Promise<PaginatedUsers> {
    const { page, pageSize, email, role } = query.input;

    let usersQuery = this.prisma.orm.public.User;

    if (email) {
      usersQuery = usersQuery.where((u) => u.email.ilike(`%${email}%`));
    }

    if (role) {
      usersQuery = usersQuery.where((u) => u.role.eq(role));
    }

    const [data, { total }] = await Promise.all([
      usersQuery
        .select('userId', 'email', 'role', 'createdAt', 'updatedAt')
        .orderBy((u) => u.createdAt.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all(),
      usersQuery.aggregate((agg) => ({ total: agg.count() })),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
