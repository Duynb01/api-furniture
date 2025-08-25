import * as cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://furniture-store-psi-two.vercel.app',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));
  const config = new DocumentBuilder()
    .setTitle('Furniture N\'s Store')
    .setDescription('Mô tả API')
    .setVersion('1.0')
    .addBearerAuth() // Nếu dùng JWT Auth
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();