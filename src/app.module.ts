import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@/libs/database/prisma.module';
import { CurrentUserMiddleware } from '@/libs/middlewares/current-user.middleware';
import { appProviders } from './apps/app.providers';

@Module({
  imports: [
    // --------------------------
    // Cấu hình biến môi trường (.env)
    // --------------------------
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.docker'
          : '.env.local',
    }),

    // --------------------------
    // Prisma ORM (database)
    // --------------------------
    PrismaModule,

    // --------------------------
    // JWT Authentication
    // --------------------------
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'LCT24H_6d73d681ed87961b07e4469f3a20f7e5',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    }),

    // --------------------------
    // Import các module ứng dụng
    // (bao gồm cm_bundle, auth, sys_users, v.v.)
    // --------------------------
    ...appProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware kiểm tra người dùng hiện tại (JWT)
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
