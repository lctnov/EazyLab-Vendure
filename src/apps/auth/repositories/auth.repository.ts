// src/apps/auth/repositories/auth.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { now } from '@/libs/utils/date.util';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.sYS_USERS.findFirst({
      where: { email, isactive: true },
    });
  }

  async createUser(data: { email: string; password: string; username: string }) {
    return this.prisma.sYS_USERS.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
        role: 'admin',
        createdby: 'system',
        createdtime: now(),
        rowguid: crypto.randomUUID(),
      },
    });
  }
}