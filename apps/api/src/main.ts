import './config/env'; // Must be first to fail fast
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation
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

  const { env } = await import('./config/env');
  const port = env.API_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS API running on: http://localhost:${port}/api`);
}
bootstrap();
