import { UnauthorizedException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { User } from '@repo/shared-types';
import { AuthService } from '../auth.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { SessionService } from '../session.service.js';

export class LoginCommand extends Command<{
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

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: LoginCommand): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, device } = command;

    const record = await this.prisma.orm.public.User.select('password')
      .where({ email })
      .first();

    if (!record || !record.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(record.password, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({ email })
      .first();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionPayload = await this.sessionService.createSession(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      device,
    );

    const tokens = await this.authService.generateTokens(sessionPayload);

    return { user, ...tokens };
  }
}
