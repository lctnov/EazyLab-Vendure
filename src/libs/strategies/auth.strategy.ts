import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const cookieExtractor = (req: any): string | null => {
  return req?.cookies?.token || null;
};

interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends (PassportStrategy(Strategy) as any) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret =
      configService.get<string>('JWT_SECRET') || 'LCT24H_6d73d681ed87961b07e4469f3a20f7e5';

    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.userId || !payload?.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  }
}
