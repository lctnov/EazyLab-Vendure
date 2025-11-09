// src/modules/apis/controllers/users.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/libs/guards/jwt-auth.guard';
import { Request } from 'express';
// (Optional) Nếu bạn dùng Swagger
// import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
// @ApiTags('Users') // Swagger group
// @ApiBearerAuth()  // Swagger auth token
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    // JWT strategy nên đã gán user vào req.user
    return {
      message: 'Lấy thông tin người dùng thành công',
      user: req.user,
    };
  }

  // Optional: future endpoints
  // @UseGuards(JwtAuthGuard)
  // @Get()
  // findAllUsers() {
  //   return this.usersService.findAll(); // giả định có service
  // }
}
