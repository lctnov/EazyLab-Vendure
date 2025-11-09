import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/libs/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  // --------------------------
  // Chọn file .env phù hợp theo NODE_ENV
  // --------------------------
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile =
    nodeEnv === 'docker'
      ? path.join(__dirname, '..', '.env.docker')
      : path.join(__dirname, '..', '.env.local');

  dotenv.config({ path: envFile });

  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`🔧 Loaded env file: ${envFile}`);

  // --------------------------
  // Tạo ứng dụng NestJS
  // --------------------------
  const app = await NestFactory.create(AppModule);

  // --------------------------
  // Global prefix cho API (vd: http://localhost:1211/api)
  // --------------------------
  app.setGlobalPrefix('api');

  // --------------------------
  // Cookie parser để đọc cookie từ request
  // --------------------------
  app.use(cookieParser());

  // --------------------------
  // Cấu hình CORS cho frontend
  // --------------------------
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001', // frontend URL
    credentials: true,
  });

  // --------------------------
  // DTO Validation toàn cục
  // --------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true, // báo lỗi nếu có field thừa
      transform: true, // tự động convert type
    }),
  );

  // --------------------------
  // Interceptor & Exception Filter toàn cục
  // --------------------------
  const coreHandler = new ResponseInterceptor();
  app.useGlobalInterceptors(coreHandler);
  app.useGlobalFilters(coreHandler);

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

  // --------------------------
  // Cấu hình Swagger UI load JSON đúng port động
  // --------------------------
  // Thay vì hardcode localhost:1211, dùng relative URL `/api-json`
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      url: '/api-json', // relative URL, tự động dùng port hiện tại
    },
  });

  // --------------------------
  // Lắng nghe PORT động (local hoặc Docker)
  // --------------------------
  const PORT = Number(process.env.PORT) || 1211;
  // '0.0.0.0' để container Docker có thể truy cập
  await app.listen(PORT, '0.0.0.0');
  const hostPort = nodeEnv === 'docker' ? 3334 : PORT;

  console.clear();
  console.log(`🚀 Backend running at: http://localhost:${hostPort}/api`);
  console.log(`📖 Swagger docs: http://localhost:${hostPort}/api-docs`);
  console.log(`🌐 Frontend CORS allowed from: ${process.env.CLIENT_URL}`);
}

bootstrap();
