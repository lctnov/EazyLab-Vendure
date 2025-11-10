// src/apps/auth/controllers/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '@/apps/auth/services/auth/auth.service';
import { RegisterDto } from '@/apps/auth/dto/register.dto';
import { LoginDto } from '@/apps/auth/dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token;
    return this.authService.logout(token, res);
  }

  @Post('exp')
  async expUsers(@Req() req: Request) {
    const token = req.cookies?.token;
    return this.authService.expUsers(token);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    return this.authService.refreshToken(user, res);
  }
}