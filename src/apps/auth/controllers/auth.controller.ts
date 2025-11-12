import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '@/apps/auth/services/auth/auth.service';
import { RegisterDto } from '@/apps/auth/dto/register.dto';
import { LoginDto } from '@/apps/auth/dto/login.dto';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/libs/decorators/public.decorator'

@Public()
@ApiTags('Quản lý người dùng')
@Controller('v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token;
    return this.authService.logout(token, res);
  }

  @Post('exp')
  @ApiOperation({ summary: 'Kiểm tra token xem còn hạn không' })
  async expUsers(@Req() req: Request) {
    const token = req.cookies?.token;
    return this.authService.expUsers(token);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Hết thời gian tự động xóa token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    return this.authService.refreshToken(user, res);
  }
}