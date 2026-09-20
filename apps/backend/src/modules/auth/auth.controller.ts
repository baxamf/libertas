import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  SerializeOptions,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { IsPublic } from '../../core/decorators/is-public.decorator.js';
import { LoginCommand } from './commands/login.handler.js';
import { RegisterCommand } from './commands/register.handler.js';
import { GetMeQuery } from './queries/me.handler.js';
import { AuthService } from './auth.service.js';
import {
  RegisterSchema,
  LoginSchema,
  UserSchema,
  ChangePasswordSchema,
  UserSessionSchema,
} from '@repo/shared-types';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UserSession,
} from '@repo/shared-types';
import { UserLoggedOutEvent } from './events/user-logged-out.handler.js';
import { ChangePasswordCommand } from './commands/change-password.handler.js';
import { DeleteSessionCommand } from './commands/delete-session.handler.js';

@SkipThrottle({ auth: true })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  @SkipThrottle({ auth: false })
  @Post('register')
  @IsPublic()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    standardSchema: UserSchema,
    description: 'User registered successfully',
  })
  @SerializeOptions({ schema: UserSchema })
  async register(
    @Body({ schema: RegisterSchema }) dto: RegisterInput,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() { headers }: FastifyRequest,
  ) {
    const device = headers['user-agent'];
    const result = await this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, device),
    );

    this.authService.setTokenCookies(reply, result);
    return result.user;
  }

  @SkipThrottle({ auth: false })
  @Post('login')
  @IsPublic()
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({
    standardSchema: UserSchema,
    description: 'User logged in successfully',
  })
  @SerializeOptions({ schema: UserSchema })
  async login(
    @Body({ schema: LoginSchema }) dto: LoginInput,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const device = req.headers['user-agent'];
    const result = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, device),
    );
    this.authService.setTokenCookies(reply, result);
    return result.user;
  }

  @Post('logout')
  @IsPublic()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out and clear session cookies' })
  @ApiNoContentResponse({ description: 'Logged out successfully' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const user = req.user;

    this.authService.clearTokenCookies(reply);

    if (user?.jti) this.eventBus.publish(new UserLoggedOutEvent(user.jti));
  }

  @SkipThrottle({ auth: false })
  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Change the user's password" })
  @ApiNoContentResponse({ description: 'Password changed successfully' })
  async changePassword(
    @Body({ schema: ChangePasswordSchema }) dto: ChangePasswordInput,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = req.user!;
    const device = req.headers['user-agent'];

    const result = await this.commandBus.execute(
      new ChangePasswordCommand(user.sub, dto, device),
    );

    this.authService.setTokenCookies(reply, result);
    this.eventBus.publish(new UserLoggedOutEvent(user.jti));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiOkResponse({
    standardSchema: UserSchema,
    description: 'Current authenticated user',
  })
  @SerializeOptions({ schema: UserSchema })
  async me(@Req() req: FastifyRequest) {
    return this.queryBus.execute(new GetMeQuery(req.user!.sub));
  }

  @Delete('session/:id')
  @ApiOperation({ summary: 'Delete a specific session by ID' })
  @ApiOkResponse({
    standardSchema: UserSessionSchema,
    description: 'Session deleted successfully',
  })
  @SerializeOptions({ schema: UserSessionSchema })
  async deleteSession(
    @Param('id') sessionId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<UserSession> {
    const { sub: userId, jti } = req.user!;

    const deletedSession = await this.commandBus.execute(
      new DeleteSessionCommand(userId, sessionId, jti),
    );

    if (deletedSession.isCurrent) {
      this.authService.clearTokenCookies(reply);
    }

    return deletedSession;
  }
}
