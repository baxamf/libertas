import {
  Injectable,
  PlainLiteralObject,
  StandardSchemaSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZodObject } from 'zod';
import { ZodException } from '../exceptions/zod.exceptions.js';

@Injectable()
export class GlobalZodSerializerInterceptor extends StandardSchemaSerializerInterceptor {
  constructor(readonly reflector: Reflector) {
    super(reflector);
  }

  async transformToPlain(
    plainOrClass: PlainLiteralObject,
    schema: ZodObject,
  ): Promise<PlainLiteralObject> {
    if (!plainOrClass) return plainOrClass;

    // Response objects hold rich domain values (e.g. Temporal.Instant), so encode
    // them back to their wire representation (e.g. ISO string) before sending.
    const zodResult = await schema.safeEncodeAsync(plainOrClass);

    if (!zodResult.success) {
      throw new ZodException(zodResult.error);
    }

    return zodResult.data;
  }
}
