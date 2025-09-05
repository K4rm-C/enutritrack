// backend/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  // Configurar CORS
  app.enableCors({
    origin: 'http://localhost:5174',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3004);
  console.log('User Service running on port 3004 (HTTP) and 3104 (TCP)');
}
bootstrap();
