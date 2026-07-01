import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS
  app.enableCors({ origin: config.get('client.url'), credentials: true });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe — whitelist strip unknown fields, transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (dev only)
  if (config.get('nodeEnv') !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('SolarDV API')
      .setDescription('REST API cho hệ thống SolarDV')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api/v1`);
  if (config.get('nodeEnv') !== 'production') {
    console.log(`Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap();
