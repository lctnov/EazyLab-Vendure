import { Request } from 'express';
import { SYS_USERS } from '@prisma/client';

export interface RequestWithUser extends Request {
  user?: SYS_USERS;
}
