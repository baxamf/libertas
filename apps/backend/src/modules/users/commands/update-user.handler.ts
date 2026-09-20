import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { UpdateUserInput, User } from '@repo/shared-types';
import { PrismaService } from '../../database/prisma.service.js';

export class UpdateUserCommand extends Command<User> {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateUserInput,
  ) {
    super();
  }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<
  UpdateUserCommand,
  User
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { userId, data } = command;

    const existing = await this.prisma.orm.public.User.where({
      userId,
    }).first();

    if (!existing) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const updateData: UpdateUserInput = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) {
      updateData.password = await argon2.hash(data.password);
    }
    if (data.role !== undefined) updateData.role = data.role;

    const updated = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({
        userId,
      })
      .update(updateData);

    if (!updated) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    return updated;
  }
}
