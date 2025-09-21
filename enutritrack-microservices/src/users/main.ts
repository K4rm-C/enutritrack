import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { xmlParser } from '../middleware/xml-parser.middleware';
import { XmlInterceptor } from '../interceptor/xml.interceptor';

async function bootstrap() {
  // Crear aplicación HTTP
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.use('/users', xmlParser);
  app.useGlobalInterceptors(new XmlInterceptor());
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
  await app.listen(3001);
  console.log('User Service running on port 3001 (HTTP) and 3101 (TCP)');
}
bootstrap();
