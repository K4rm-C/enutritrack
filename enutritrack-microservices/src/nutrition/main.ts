import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Crear aplicación HTTP
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5174'],
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('User Service running on port 3003 (HTTP) and 3103 (TCP)');
}
bootstrap();
