import { Injectable, Logger } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import type { FastifyReply } from 'fastify';
import type { JwtConfig } from '../../config/app.config.js';
import type { AppConfig } from '../../config/app.config.js';
import type { JwtPayload } from '@repo/shared-types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly encodedAccessKey: Uint8Array;
  private readonly encodedRefreshKey: Uint8Array;

  constructor(private readonly configService: ConfigService) {
    this.encodedAccessKey = new TextEncoder().encode(
      this.configService.get<JwtConfig>('JWT')!.accessSecret,
    );
    this.encodedRefreshKey = new TextEncoder().encode(
      this.configService.get<JwtConfig>('JWT')!.refreshSecret,
    );
  }

  async generateTokens(dto: JwtPayload): Promise<TokenPair> {
    const jwtConf = this.configService.get<JwtConfig>('JWT')!;
    const { jti, ...payload } = dto;
    const accessExpiresAtTemporal = Temporal.Now.instant().add({
      seconds: jwtConf.accessExpiresInSeconds,
    });
    const refreshExpiresAtTemporal = Temporal.Now.instant().add({
      seconds: jwtConf.refreshExpiresInSeconds,
    });

    const [accessToken, refreshToken] = await Promise.all([
      new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(accessExpiresAtTemporal.epochMilliseconds)
        .setJti(jti)
        .sign(this.encodedAccessKey),
      new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(refreshExpiresAtTemporal.epochMilliseconds)
        .setJti(jti)
        .sign(this.encodedRefreshKey),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyToken(
    token: string,
    tokenType: 'access' | 'refresh',
  ): Promise<JwtPayload> {
    const encodedSecretKey =
      tokenType === 'access' ? this.encodedAccessKey : this.encodedRefreshKey;

    try {
      const { payload } = await jwtVerify<JwtPayload>(token, encodedSecretKey, {
        algorithms: ['HS256'],
      });
      return payload;
    } catch (error) {
      if (error instanceof Error)
        Logger.warn(
          `Failed to verify ${tokenType} token: ${error?.message}`,
          AuthService.name,
        );
      throw error;
    }
  }

  setTokenCookies(reply: FastifyReply, tokens: TokenPair): void {
    const jwtConf = this.configService.get<JwtConfig>('JWT')!;
    const isProduction =
      this.configService.get<AppConfig>('APP')?.nodeEnv === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    };

    reply.setCookie(jwtConf.accessCookieName, tokens.accessToken, {
      ...cookieOptions,
      maxAge: jwtConf.accessExpiresInSeconds,
    });
    reply.setCookie(jwtConf.refreshCookieName, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: jwtConf.refreshExpiresInSeconds,
    });
  }

  clearTokenCookies(reply: FastifyReply): void {
    const cfg = this.configService.get<JwtConfig>('JWT')!;
    reply.clearCookie(cfg?.accessCookieName, { path: '/' });
    reply.clearCookie(cfg?.refreshCookieName, { path: '/' });
  }
}
