import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/libs/database/prisma.service';
import { RequestWithUser } from '@/libs/interfaces/request-with-user.interface';
import { SYS_USERS } from '@prisma/client';

interface JwtPayload {
  rowguid: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) return next();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      
      const user: SYS_USERS | null = await this.prisma.client.sYS_USERS.findFirst({
        where: { email: payload.email },
      });

      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      req.user = user;
    } catch (err) {
      console.warn('Lỗi xác thực token:', err.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    next();
  }
}
