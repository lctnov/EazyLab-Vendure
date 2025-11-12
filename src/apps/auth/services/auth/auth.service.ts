// src/apps/auth/services/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '@/apps/auth/dto/register.dto';
import { LoginDto } from '@/apps/auth/dto/login.dto';
import { Response } from 'express';
import { AuthRepository } from '@/apps/auth/repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      return {
        iPayload: null,
        iStatus: false,
        iMessage: 'Email đã tồn tại',
      };
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createUser({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
    });

    const userInfo = {
      id: user.rowguid.toString(),
      email: user.email,
      name: user.username,
    };

    return {
      iPayload: userInfo,
      iStatus: true,
      iMessage: 'Đăng ký thành công',
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      return null;
    }

    const payload = {
      rowguid: user.rowguid.toString(),
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return access_token;
  }

  async refreshToken(user: any, res: Response) {
    const payload = {
      rowguid: user.rowguid,
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return {
      iPayload: { access_token },
      iStatus: true,
      iMessage: 'Token đã được làm mới',
    };
  }

  async expUsers(token: string) {
    if (!token) {
      return {
        iPayload: null,
        iStatus: false,
        iMessage: 'Không có mã thông báo nào được cung cấp',
      };
    }

    try {
      const decoded = this.jwtService.verify(token);
      return {
        iPayload: decoded,
        iStatus: true,
        iMessage: 'Token hợp lệ',
      };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return {
          iPayload: null,
          iStatus: false,
          iMessage: 'Token đã hết hạn',
        };
      }
      return {
        iPayload: null,
        iStatus: false,
        iMessage: 'Token không hợp lệ',
      };
    }
  }

  // verifyToken cho Guard
  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Không có mã thông báo nào được cung cấp');
    }

    try {
      const decoded = this.jwtService.verify(token);
      return decoded; // Trả về payload
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      }
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  async logout(token: string, res: Response) {
    if (!token) {
      return {
        iPayload: null,
        iStatus: false,
        iMessage: 'Không có token trong cookie',
      };
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    return {
      iPayload: null,
      iStatus: true,
      iMessage: 'Đăng xuất thành công',
    };
  }
}