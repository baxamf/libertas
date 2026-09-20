import { ConflictException } from '@nestjs/common';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { User } from '@repo/shared-types';
import { UserCreatedEvent } from '../../users/events/user-created.handler.js';
import { AuthService } from '../auth.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { SessionService } from '../session.service.js';

export class RegisterCommand extends Command<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly device = 'unknown',
  ) {
    super();
  }
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterCommand): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, device } = command;

    const existing = await this.prisma.orm.public.User.select('email')
      .where({ email })
      .first();
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await argon2.hash(password);

    const [record, sessionPayload] = await this.prisma.db.transaction(
      async (tx) => {
        const record = await tx.orm.public.User.select(
          'userId',
          'email',
          'role',
          'createdAt',
          'updatedAt',
        ).create({
          email,
          password: hashedPassword,
        });

        const sessionPayload = await this.sessionService.createSession(
          {
            userId: record.userId,
            email: record.email,
            role: record.role,
          },
          device,
          tx,
        );

        return [record, sessionPayload];
      },
    );

    const tokens = await this.authService.generateTokens(sessionPayload);

    this.eventBus.publish(new UserCreatedEvent(record.userId, email));

    return { user: record, ...tokens };
  }
}
