import { HttpException, HttpStatus } from '@nestjs/common';
import { z, ZodError } from 'zod';

export class ZodException extends HttpException {
  constructor(
    private readonly zodError: ZodError,
    status:
      | HttpStatus.BAD_REQUEST
      | HttpStatus.INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    const message = z.prettifyError(zodError);
    super(message, status);
  }

  getZodError(): ZodError {
    return this.zodError;
  }
}
