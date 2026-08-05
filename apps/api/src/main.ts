import { env } from './config/env'; // Must be first to fail fast
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      requestIdHeader: 'x-request-id',
      genReqId: (req) => {
        const id = req.headers['x-request-id'] || req.headers['X-Request-Id'] || uuidv4();
        return Array.isArray(id) ? id[0] : id;
      },
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS using verified env configuration
  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  // Global validation filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('PGS Hub API')
    .setDescription('PGS Hub Foundations API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = env.API_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS API running on: http://localhost:${port}/api`);
}
bootstrap();
