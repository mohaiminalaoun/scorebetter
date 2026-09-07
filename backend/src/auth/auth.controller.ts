import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { env } from '../config/env';
import { AuthService } from './auth.service';
import { buildClearedSessionCookie, buildSessionCookie } from './cookies';
import { SessionGuard, type AuthenticatedRequest } from './session.guard';
import { SESSION_TOKEN_TTL_SECONDS, signToken } from './tokens';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request')
  @HttpCode(200)
  async requestLink(@Body() body: { email?: unknown }): Promise<{ ok: true }> {
    await this.authService.maybeSendLink(body?.email);
    return { ok: true };
  }

  @Get('callback')
  callback(@Query('token') token: string | undefined, @Res() response: Response): void {
    const email = this.authService.emailFromLoginToken(token);

    // Redirect rather than render an error, so she lands in the app either way.
    if (!email) {
      response.redirect(302, `${env.APP_URL}/?auth=invalid`);
      return;
    }

    const session = signToken('session', email, SESSION_TOKEN_TTL_SECONDS);
    response.setHeader('Set-Cookie', buildSessionCookie(session));
    response.redirect(302, `${env.APP_URL}/`);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() request: AuthenticatedRequest): { email: string } {
    return { email: request.user!.email };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res() response: Response): void {
    response.setHeader('Set-Cookie', buildClearedSessionCookie());
    response.json({ ok: true });
  }
}
