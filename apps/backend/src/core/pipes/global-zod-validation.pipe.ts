import { Injectable, StandardSchemaValidationPipe } from '@nestjs/common';
import { ZodError } from 'zod';
import { ZodException } from '../exceptions/zod.exceptions.js';

@Injectable()
export class GlobalZodValidationPipe extends StandardSchemaValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors) => {
        const zodError = new ZodError(
          errors.map((error) => ({
            message: error.message,
            code: 'custom',
            path: error.path?.map(String) || [],
          })),
        );
        return new ZodException(zodError, 400);
      },
    });
  }
}
