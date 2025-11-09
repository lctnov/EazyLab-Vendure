import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: () => {
        const nodeEnv = process.env.NODE_ENV || 'development';
        return nodeEnv === 'docker' ? '.env.docker' : '.env.local';
      },
    }),
    // DatabaseModule,
  ],
})
export class AppModule {}
