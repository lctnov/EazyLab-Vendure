import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/libs/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { CookieJwtGuard } from './apps/common/guards/cookie-jwt.guard';
import { Reflector } from '@nestjs/core';
import { AuthService } from './apps/auth/services/auth/auth.service';
import { HttpExceptionFilter } from './libs/filters/http-exception.filter';

async function bootstrap() {
  // --------------------------
  // Load .env theo môi trường
  // --------------------------
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile = nodeEnv === 'docker' ? path.join(__dirname, '..', '.env.docker') : path.join(__dirname, '..', '.env.local');

  dotenv.config({ path: envFile });

  console.log(`Environment: ${nodeEnv}`);
  console.log(`Loaded env file: ${envFile}`);

  // --------------------------
  // Tạo ứng dụng NestJS
  // --------------------------
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');


  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);

  app.useGlobalGuards(new CookieJwtGuard(authService, reflector));

  // --------------------------
  // Middleware
  // --------------------------
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  });

  // --------------------------
  // Validation toàn cục
  // --------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // --------------------------
  // Global Interceptor + Filter (chỉ 1)
  // --------------------------
  const coreHandler = new ResponseInterceptor();
  app.useGlobalInterceptors(coreHandler);
  app.useGlobalFilters(new HttpExceptionFilter());

  // --------------------------
  // Swagger Documentation
  // --------------------------
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Swagger UI cho dự án NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      url: '/api-json',
    },
  });

  // --------------------------
  // Khởi động server
  // --------------------------
  const PORT = Number(process.env.PORT) || 1211;
  await app.listen(PORT, '0.0.0.0');
  console.log('nodeEnv', nodeEnv);
  
  const hostPort = nodeEnv === 'production' ? 1311 : PORT;

  console.clear();
  console.log(`Backend running at: http://localhost:${hostPort}/api`);
  console.log(`Swagger docs: http://localhost:${hostPort}/api-docs`);
  console.log(`Frontend CORS allowed from: ${process.env.CLIENT_URL || 'http://localhost:3001'}`);
}

bootstrap();