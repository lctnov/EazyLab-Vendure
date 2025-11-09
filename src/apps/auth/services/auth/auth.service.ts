// src/modules/apis/services/auth/auth.service.ts
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
import { AuthRepository } from '../../repositories/auth.repository';
// import { PrismaService } from '@/libs/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    // private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing){
      // throw new ConflictException('Email đã tồn tại');
      return { message: 'Email đã tồn tại', payload: null, status: false};
    } 

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.authRepository.createUser({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
    });

    let userInfo = { id: user.rowguid, email: user.email, name: user.username};
    
    return {
      message: 'Đăng ký thành công',
      payload: userInfo,
      status: true
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    console.log('user', user);
    
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      // throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      return { message: 'Email hoặc mật khẩu không đúng', payload: null, status: false};
    }

    const payload = { 'rowguid': user.rowguid, 'username': user.username, 'email': user.email };
    
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    // Cookie config: dev/prod friendly
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Prod: yêu cầu HTTPS
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Prod: strict chống CSRF
      maxAge: 60 * 60 * 1000, // 1 giờ
      path: '/', // Cookie toàn site
    });

    return { message: 'Đăng nhập thành công', payload: access_token, status: true};
  }

  async refreshToken(user: any, res: Response) {
    const payload = { 'rowguid': user.rowguid, 'username': user.username, 'email': user.email, 'officescope': user.officescope, 'officename': user.officename };

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
      message: 'Token cung cấp thành công',
      payload: access_token,
      status: true
    };
  }

  // Kiểm tra token còn hiệu lực không
  async expUsers(token: string) {
    if (!token) {
      // throw new UnauthorizedException('Không có mã thông báo nào được cung cấp');
      return { message: 'Không có mã thông báo nào được cung cấp', payload: null, status: false};
    }

    try {
      // Verify token JWT, nếu hết hạn hoặc sai sẽ ném lỗi
      let decoded = this.jwtService.verify(token);
      // console.log('decoded', decoded);
      // Token hợp lệ, trả về kết quả
      // const result = { expired: false, decoded };
      return { message: 'Token hợp lệ', payload: decoded, status: true};
    } catch (err) {
      // console.log('interceptor', err);
      if (err.name === 'TokenExpiredError') {
        // Token hết hạn
        return { message: 'Token hợp lệ', payload: null, status: true };
      } else {
        // Token không hợp lệ
        return { message: 'Token không hợp lệ', payload: null, status: false };
      }
    }
  }

  //Chức năng logout - clear token
  async logout(token: string, res: Response) {
    if (!token) {
      // throw new UnauthorizedException('Không có token trong cookie');
      return {message: 'Không có token trong cookie', payload: null, status: false };
    }

    // Clear cookie (HTTP-only)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully', payload: null, status: true };
  }

  // Optional: sau này nếu muốn quản lý menu theo role
  private getMenusByRole(role: string) {
    const menus: Record<string, string[]> = {
      admin: ['dashboard', 'users', 'settings'],
      user: ['dashboard', 'profile'],
      guest: [],
    };
    return menus[role] || [];
  }
}
