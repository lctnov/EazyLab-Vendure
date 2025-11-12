import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/apps/auth/services/auth/auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/libs/decorators/public.decorator';
  
@Injectable()
export class CookieJwtGuard implements CanActivate {
	constructor(
	  private authService: AuthService,
	  private reflector: Reflector,
	) {}
  
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
		context.getHandler(),
		context.getClass(),
	  ]);
  
	  if (isPublic) return true;
  
	  const request = context.switchToHttp().getRequest<Request>();
	  const token = request.cookies?.token;
  
	  if (!token) {
		throw new UnauthorizedException('Token không tồn tại !!!');
	  }
  
	  try {
		const payload = await this.authService.verifyToken(token);
		request.user = payload;
		return true;
	  } catch (error) {
		throw new UnauthorizedException(error.message || 'Token không hợp lệ !!!');
	  }
	}
}