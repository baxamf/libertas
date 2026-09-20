import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    let message = 'Internal server error';
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      message = exception.message;
      httpStatus = exception.getStatus();
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    Logger.error(
      `HTTP Status: ${httpStatus} Error Message: ${message}`,
      exception instanceof Error ? exception.stack : '',
      GlobalExceptionFilter.name,
    );

    reply.status(httpStatus).send(responseBody);
  }
}
