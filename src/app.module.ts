import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@/libs/database/prisma.module';
import { CurrentUserMiddleware } from '@/libs/middlewares/current-user.middleware';
import { appProviders } from './apps/app.providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'LCT24H_6d73d681ed87961b07e4469f3a20f7e5',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),

    ...appProviders
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('*'); // 👉 Hoặc chỉ định cụ thể route/module
  }
}
