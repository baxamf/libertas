import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  appConfig,
  jwtConfig,
  ConfigValidationSchema,
} from './config/app.config.js';
import { JwtGuard } from './core/guards/jwt.guard.js';
import { ThrottlerBehindProxyGuard } from './core/guards/throttler.guard.js';
import { RolesGuard } from './core/guards/roles.guard.js';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter.js';
import { GlobalZodValidationPipe } from './core/pipes/global-zod-validation.pipe.js';
import { GlobalZodSerializerInterceptor } from './core/interceptors/global-zod-serializer.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      validationSchema: ConfigValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'api',
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 900_000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    CqrsModule.forRoot(),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_PIPE,
      useClass: GlobalZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
