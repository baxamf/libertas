import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PrismaService } from '../../database/prisma.service.js';

export class DeleteUserCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const existing = await this.prisma.orm.public.User.where({
      userId: command.id,
    }).first();

    if (!existing) {
      throw new NotFoundException(`User with id "${command.id}" not found`);
    }

    await this.prisma.orm.public.User.where({ userId: command.id }).delete();
  }
}
