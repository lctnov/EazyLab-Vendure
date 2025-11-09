// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@/libs/database/prisma.module'; // ✅ import đúng module

@Module({
  imports: [PrismaModule], // ✅ import module, không phải service
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
