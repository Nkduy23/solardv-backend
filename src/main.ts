import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const isProd = config.get('nodeEnv') === 'production';

  app.use(cookieParser());

  const clientUrl = config.get<string>('client.url');
  app.enableCors({
    origin: isProd ? clientUrl : true,
    credentials: true, // bắt buộc để cookie được gửi cross-subdomain
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (!isProd) {
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
}

bootstrap();
