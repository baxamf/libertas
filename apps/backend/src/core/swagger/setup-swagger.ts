import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { createSchema } from 'zod-openapi';

/**
 * Sets up Swagger (OpenAPI) documentation for the given NestFastifyApplication.
 * @param app The NestFastifyApplication instance.
 */
export function setupSwagger(app: NestFastifyApplication) {
  const documentOptions: SwaggerDocumentOptions = {
    // Wire format is always the schema's input side (e.g. ISO string), for both
    // request params and responses, regardless of the schemaType NestJS passes.
    standardSchemaConverter: (schema) => {
      const converted = createSchema(schema as never, {
        io: 'input',
        openapiVersion: '3.2.0',
      });

      return { schema: converted.schema, components: converted.components };
    },
    excludeDynamicDefaults: true,
  };

  const config = new DocumentBuilder()
    .setTitle('API documentation')
    .setDescription('List of all API endpoints for the application')
    .setVersion('1.0')
    .addCookieAuth(process.env.JWT_ACCESS_COOKIE_NAME ?? 'access')
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .addGlobalResponse({
      status: 401,
      description: 'Unauthorized',
    })
    .addGlobalResponse({
      status: 403,
      description: 'Forbidden',
    })
    .addGlobalResponse({
      status: 400,
      description: 'Bad Request',
    })
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, documentOptions);

  SwaggerModule.setup('api', app, documentFactory, { raw: ['json'] });
}
