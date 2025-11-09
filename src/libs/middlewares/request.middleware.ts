import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Ví dụ kiểm tra Content-Type
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!req.is('application/json')) {
        throw new BadRequestException('Request must be JSON');
      }
    }

    // Ví dụ kiểm tra header API version
    if (!req.headers['x-api-version']) {
      throw new BadRequestException('Missing API version header');
    }

    next();
  }
}