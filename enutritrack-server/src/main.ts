// backend/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { xmlParser } from './middleware/xml-parser.middleware';
import { XmlInterceptor } from './interceptor/xml.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use('/users', xmlParser);
  app.use('/doctors', xmlParser);
  app.useGlobalInterceptors(new XmlInterceptor());
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
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Enutritrack BACKEND')
    .setDescription('API para el sistema de nutrición preventiva')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4000);
}
bootstrap();
