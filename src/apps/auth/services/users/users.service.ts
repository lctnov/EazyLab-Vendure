import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(email: string) {
    const user = await this.prisma.client.sYS_USERS.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user: ${email}`);
    }
  
    return user;
  }

  async findById(id: number) {
    const user = await this.prisma.client.sYS_USERS.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    }

    return user;
  }

  // Optional: lấy tất cả user
  async findAll() {
    return this.prisma.client.sYS_USERS.findMany();
  }
}
