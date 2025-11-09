import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@/apps/auth/services/auth/auth.service';
import { RegisterDto } from '@/apps/auth/dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/libs/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<any> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req.cookies['token'], res);
  }

  @Post('exp')
  async expUsers(@Req() req: Request) {
    return this.authService.expUsers(req.cookies['token']);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    return this.authService.refreshToken(user, res);
  }
}
