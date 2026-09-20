import 'temporal-polyfill/full/global';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { setupSwagger } from './core/swagger/setup-swagger.js';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  );

  const config = app.get(ConfigService);
  const port = config.get<AppConfig['port']>('APP.port')!;
  const allowedOrigins =
    config.get<AppConfig['corsOrigin']>('APP.corsOrigin')?.split(',') || [];
  const cookieSecret =
    config.get<AppConfig['cookieSecret']>('APP.cookieSecret')!;

  app.enableCors({
    origin: allowedOrigins.length
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), origin);
          }
        }
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Forwarded-For',
      'CF-Connecting-IP',
      'CF-IPCountry',
    ],
    credentials: true,
  });

  await app.register(fastifyCookie, { secret: cookieSecret });

  setupSwagger(app);

  await app.listen(port ?? 5000, '0.0.0.0');
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
