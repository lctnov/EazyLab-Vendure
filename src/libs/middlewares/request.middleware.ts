import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!req.is('application/json')) {
        throw new BadRequestException('Content-Type must be application/json');
      }
    }

    if (!req.headers['x-api-version']) {
      throw new BadRequestException('Missing header: x-api-version');
    }

    next();
  }
}