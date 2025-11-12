import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const nodeEnv = process.env.NODE_ENV?.trim();
        console.log('NODE_ENV:', nodeEnv);

        if (nodeEnv === 'production' || nodeEnv === 'docker') {
          return '.env.docker';
        }
        return '.env.local';
      })(),
    }),
  ],
})
export class AppModule {}