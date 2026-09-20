import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator.js';
import type { JwtConfig } from '../../config/app.config.js';
import type { JwtPayload } from '@repo/shared-types';
import { AuthService } from '../../modules/auth/auth.service.js';
import { SessionService } from '../../modules/auth/session.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    const jwtConf = this.configService.get<JwtConfig>('JWT')!;
    const { accessCookieName, refreshCookieName } = jwtConf;

    const accessToken = request.cookies?.[accessCookieName];
    const refreshToken = request.cookies?.[refreshCookieName];

    // 1. Try validating accessToken
    if (accessToken) {
      try {
        const accessPayload = await this.authService.verifyToken(
          accessToken,
          'access',
        );
        request.user = accessPayload;
        return true;
      } catch {
        // Access token invalid or expired; clear it and fall through to refresh token
        reply.clearCookie(accessCookieName, { path: '/' });
      }
    }

    // 2. If no refresh token is available
    if (!refreshToken) {
      if (isPublic) return true;
      throw new UnauthorizedException('No valid session');
    }

    // 3. Try validating refreshToken and rotating session
    try {
      const payload = await this.authService.verifyToken(
        refreshToken,
        'refresh',
      );

      const newPayload = await this.sessionService.rotateSession(
        payload.jti,
        payload.sub,
      );

      const newTokens = await this.authService.generateTokens(newPayload);

      this.authService.setTokenCookies(reply, {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      });

      request.user = {
        sub: newPayload.sub,
        email: newPayload.email,
        role: newPayload.role,
        jti: newPayload.jti,
      };

      return true;
    } catch (error) {
      // Clear both access and refresh token cookies
      this.authService.clearTokenCookies(reply);

      if (isPublic) return true;

      if (error instanceof Error)
        Logger.error(
          `Failed to rotate session: ${error.message}`,
          JwtGuard.name,
        );
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
