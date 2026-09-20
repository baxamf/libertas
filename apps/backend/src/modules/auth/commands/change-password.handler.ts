import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service.js';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ChangePasswordInput } from '@repo/shared-types';
import { SessionService } from '../session.service.js';
import { AuthService } from '../auth.service.js';
import type { TokenPair } from '../auth.service.js';

export class ChangePasswordCommand extends Command<TokenPair> {
  constructor(
    public readonly userId: string,
    public readonly passwordInput: ChangePasswordInput,
    public readonly device = 'unknown',
  ) {
    super();
  }
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: ChangePasswordCommand) {
    const { userId, passwordInput, device } = command;
    const { oldPassword, newPassword } = passwordInput;

    const record = await this.prisma.orm.public.User.select('password')
      .where({ userId })
      .first();

    if (!record || !record.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(record.password, oldPassword);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await argon2.hash(newPassword);

    const result = await this.prisma.db.transaction(async (tx) => {
      const user = await tx.orm.public.User.where({ userId })
        .select('userId', 'email', 'role')
        .update({
          password: hashedPassword,
        });

      if (!user) {
        throw new InternalServerErrorException(
          'Failed to update user password',
        );
      }

      const session = await this.sessionService.createSession(user, device, tx);

      return session;
    });

    const tokens = await this.authService.generateTokens(result);

    return tokens;
  }
}
