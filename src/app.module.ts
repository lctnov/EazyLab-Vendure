// src/app.module.ts
import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@/libs/database/prisma.module';
import { CurrentUserMiddleware } from '@/libs/middlewares/current-user.middleware';
import { appProviders } from './apps/app.providers';
import { PrismaService } from '@/libs/database/prisma.service';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Module({
  imports: [
    // --------------------------
    // 1. Cấu hình .env (global)
    // --------------------------
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.docker' : '.env.local',
    }),

    // --------------------------
    // 2. CLS + Transactional (v3.1.0) – BẮT BUỘC
    // --------------------------
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService, // ← class, không instance
          }),
        }),
      ],
    }),

    // --------------------------
    // 3. Prisma ORM
    // --------------------------
    PrismaModule,

    // --------------------------
    // 4. JWT Authentication
    // --------------------------
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is missing in .env');
        }
        return {
          secret,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN
              ? parseInt(process.env.JWT_EXPIRES_IN, 10)
              : 3600,
          },
        };
      },
    }),

    // --------------------------
    // 5. Import các module ứng dụng
    // --------------------------
    ...appProviders,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}