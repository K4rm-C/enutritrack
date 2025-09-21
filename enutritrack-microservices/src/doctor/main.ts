import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { XmlInterceptor } from '../interceptor/xml.interceptor';
import { xmlParser } from '../middleware/xml-parser.middleware';

async function bootstrap() {
  // Crear aplicación HTTP
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use('/doctors', xmlParser);
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
  await app.listen(3007);
  console.log('Doctor Service running on port 3007 (HTTP) and 3107 (TCP)');
}
bootstrap();
