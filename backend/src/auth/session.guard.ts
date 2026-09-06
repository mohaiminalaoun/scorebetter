import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE_NAME, readCookie } from './cookies';
import { verifyToken } from './tokens';

export interface AuthenticatedRequest extends Request {
  user?: { email: string };
}

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
    const payload = verifyToken(token, 'session');

    if (!payload) throw new UnauthorizedException();

    request.user = { email: payload.e };
    return true;
  }
}
