import { Module } from '@nestjs/common';
import { SysUsersController } from './controllers/sys_users.controller';
import { SysUsersService } from './services/sys_users.service';
import { SysUsersRepository } from './repositories/sys_users.repository';
import { PrismaService } from '@libs/database/prisma.service';

@Module({
  controllers: [SysUsersController],
  providers: [
    SysUsersService,
    SysUsersRepository,
    PrismaService,
  ],
  exports: [SysUsersService],
})
export class SysUsersModule {}
