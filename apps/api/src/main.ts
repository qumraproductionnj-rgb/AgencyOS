import { initSentry } from './sentry'
initSentry()
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import * as express from 'express'

// BigInt serialization for JSON responses
;(BigInt.prototype as unknown as Record<string, unknown>)['toJSON'] = function () {
  return Number(this)
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true })

  // Logger
  app.useLogger(app.get(Logger))

  // Security headers
  app.use(helmet())

  // CORS — restrict in production via env
  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  })

  // Global prefix + versioning. /health is intentionally unprefixed for ops/monitoring.
  app.setGlobalPrefix('api', { exclude: ['health'] })
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global exception filter — RFC 7807 Problem Details
  app.useGlobalFilters(new AllExceptionsFilter())

  // Swagger (dev only)
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AgencyOS API')
      .setDescription('AgencyOS — Operating System for Marketing & Creative Production Agencies')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  // Increase JSON body size limit for file upload metadata
  app.use(express.json({ limit: '10mb' }))

  const port = process.env['PORT'] ?? 3001
  await app.listen(port)
  app.get(Logger).log(`🚀 AgencyOS API running on http://localhost:${port}/api/v1`)
  app.get(Logger).log(`📚 Swagger docs: http://localhost:${port}/api/docs`)
}

void bootstrap()
