import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../database/prisma.service.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserSession } from '@repo/shared-types';

export class DeleteSessionCommand extends Command<UserSession> {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly currentJti: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(private readonly prisma: PrismaService) {}
  async execute(command: DeleteSessionCommand) {
    const { userId, sessionId, currentJti } = command;

    const session = await this.prisma.orm.public.UserSession.select(
      'jti',
      'userId',
    )
      .where({ sessionId })
      .first();

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Session does not belong to the user');
    }

    const deletedSession = await this.prisma.orm.public.UserSession.select(
      'sessionId',
      'jti',
      'device',
      'createdAt',
      'expiresAt',
    )
      .where({
        sessionId,
      })
      .delete();

    if (!deletedSession) {
      throw new BadRequestException('Failed to delete session');
    }

    const { jti, ...rest } = deletedSession;

    return { ...rest, isCurrent: jti === currentJti };
  }
}
